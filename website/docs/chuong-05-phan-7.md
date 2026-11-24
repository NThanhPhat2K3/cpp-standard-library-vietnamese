---
id: chuong-05-phan-7
title: 'Chương 5 · unique_ptr và quyền sở hữu độc quyền'
sidebar_label: '05 · Phần 7: unique_ptr cơ bản'
---

# 5.2.5 · `unique_ptr`: quyền sở hữu độc quyền

> **Phạm vi:** Phần đầu mục 5.2.5, từ mục đích của `unique_ptr` đến quản lý mảng. Phần deleter tùy chỉnh và ví dụ tài nguyên hệ điều hành sẽ tiếp tục ở trang sau.  
> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 98–106 (PDF trang 127–135). Ghi chú bổ sung được đánh dấu riêng.

`std::unique_ptr`, có từ C++11 trong `<memory>`, thể hiện **quyền sở hữu độc quyền**. Khi chủ sở hữu bị hủy, được reset hoặc bắt đầu sở hữu đối tượng khác, tài nguyên cũ được giải phóng bằng deleter. Nó kế thừa mục tiêu của `auto_ptr` nhưng có giao diện rõ ràng hơn nhờ move semantics.

## Mục đích: gắn tài nguyên với thời hạn sống

Một hàm thường cấp phát tài nguyên, làm việc rồi giải phóng. Nếu tài nguyên gắn với đối tượng cục bộ, destructor có thể thu dọn tự động khi rời hàm. Với raw pointer, ta dễ quên `delete`, đặc biệt khi có `return` sớm hoặc ngoại lệ:

```cpp
void f() {
    ClassA* ptr = new ClassA;
    // ... nếu đoạn này ném ngoại lệ, delete không chạy
    delete ptr;
}
```

Có thể bọc công việc trong `try`/`catch (...)`, xóa rồi `throw;` khi gặp lỗi và lại xóa ở đường đi bình thường. Nhưng mã dọn dẹp lặp lại, khó mở rộng khi có nhiều tài nguyên và dễ sai. Thay vào đó, đặt quyền sở hữu vào một đối tượng tự dọn dẹp:

```cpp
#include <memory>

void f() {
    std::unique_ptr<ClassA> ptr(new ClassA);
    // ... tài nguyên được giải phóng khi ptr bị hủy
}
```

Nếu một ngoại lệ làm hàm thoát, destructor của `ptr` vẫn chạy trong quá trình unwinding. Đây là ý tưởng **RAII**: gắn tài nguyên với thời hạn sống của đối tượng. Chú thích sách ghi nhận phần trình bày động cơ được chuyển thể từ *More Effective C++* của Scott Meyers và kỹ thuật RAII được Bjarne Stroustrup trình bày trước đó.

:::note Góc nhìn hiện đại
Từ C++14, có thể viết `auto ptr = std::make_unique<ClassA>();`. Với đối tượng không cần cấp phát động hoặc đa hình, một biến giá trị cục bộ có thể đơn giản hơn. Tên `std::unique<ClassA>` trong ví dụ gốc của sách là lỗi in; kiểu đúng là `std::unique_ptr<ClassA>`.
:::

## Sử dụng như con trỏ

Với specialization cho một đối tượng, `*` giải tham chiếu và `->` truy cập thành viên:

```cpp
std::unique_ptr<std::string> up(new std::string("nico"));
(*up)[0] = 'N';
up->append("lai");
std::cout << *up << std::endl; // Nicolai
```

`unique_ptr` không hỗ trợ số học con trỏ như `++`. Constructor từ raw pointer là `explicit`, nên phải khởi tạo trực tiếp:

```cpp
std::unique_ptr<int> a = new int; // LỖI
std::unique_ptr<int> b(new int);  // hợp lệ
```

Một `unique_ptr` có thể rỗng: constructor mặc định tạo con trỏ rỗng; `reset()` hoặc gán `nullptr` giải phóng đối tượng đang sở hữu và làm nó rỗng. Có thể kiểm tra bằng `if (up)`, `up != nullptr` hoặc `up.get() != nullptr`.

`release()` khác `reset()`: nó **trả raw pointer và từ bỏ quyền sở hữu mà không xóa đối tượng**. Sau đó bên nhận phải quản lý tài nguyên đúng cách:

```cpp
std::unique_ptr<std::string> up(new std::string("nico"));
std::string* raw = up.release(); // up rỗng; raw chưa bị xóa
// ... chuyển raw cho một chủ sở hữu thích hợp, hoặc delete raw
```

## Chuyển quyền sở hữu

`unique_ptr` không thể copy, nhưng có thể move. Dùng move constructor hoặc move assignment để chuyển quyền sở hữu:

```cpp
std::unique_ptr<ClassA> up1(new ClassA);
// std::unique_ptr<ClassA> up2(up1); // LỖI: không copy được
std::unique_ptr<ClassA> up3(std::move(up1)); // chuyển quyền sở hữu
```

Sau khi move, `up3` sở hữu đối tượng, `up1` rỗng. Tương tự:

```cpp
std::unique_ptr<ClassA> a(new ClassA);
std::unique_ptr<ClassA> b(new ClassA);
// b = a;          // LỖI: không copy được
b = std::move(a); // hủy đối tượng cũ của b, chuyển quyền sở hữu từ a
```

Không thể gán trực tiếp raw pointer cho `unique_ptr`; có thể gán một `unique_ptr` tạm, gọi `reset(new ClassA)` hoặc gán `nullptr` để giải phóng tài nguyên hiện có.

:::warning Quyền sở hữu độc quyền vẫn cần được thiết lập đúng
Kiểu `unique_ptr` ngăn copy giữa hai unique pointer, nhưng không thể ngăn lập trình viên tự tạo hai unique pointer từ cùng raw pointer. Hai chủ sở hữu độc lập như vậy sẽ cố xóa cùng tài nguyên và gây hành vi không xác định.
:::

## Hàm nhận và trả quyền sở hữu

Một hàm nhận `unique_ptr` **theo giá trị** có thể là nơi nhận quyền sở hữu (*sink*):

```cpp
void sink(std::unique_ptr<ClassA> up) {
    // dùng up; nếu không chuyển tiếp, đối tượng được hủy khi ra khỏi hàm
}

std::unique_ptr<ClassA> up(new ClassA);
sink(std::move(up)); // move vào tham số theo giá trị
```

Ngược lại, hàm trả `unique_ptr` theo giá trị có thể tạo nguồn sở hữu (*source*):

```cpp
std::unique_ptr<ClassA> source() {
    std::unique_ptr<ClassA> ptr(new ClassA);
    // ...
    return ptr;
}

void g() {
    std::unique_ptr<ClassA> p;
    for (int i = 0; i < 10; ++i) {
        p = source(); // hủy đối tượng cũ của p trước khi nhận đối tượng mới
    }
} // hủy đối tượng cuối cùng
```

Không cần `std::move(ptr)` ở `return`: ngôn ngữ có thể áp dụng NRVO hoặc move phù hợp. Không trả `unique_ptr&&` tham chiếu tới biến cục bộ, vì tham chiếu đó sẽ bị treo sau khi hàm kết thúc. Một tham số kiểu `unique_ptr<T>&&` tự nó chỉ là tham chiếu; hàm chỉ thực sự nhận quyền sở hữu nếu move từ tham số đó.

## `unique_ptr` làm thành viên lớp

Nếu constructor một lớp cấp phát nhiều tài nguyên bằng raw pointer và lần cấp phát thứ hai ném ngoại lệ, destructor của lớp bao ngoài chưa được xây dựng hoàn tất sẽ không chạy. Tài nguyên đầu tiên có thể bị rò rỉ:

```cpp
class ClassB {
    ClassA* ptr1;
    ClassA* ptr2;
public:
    ClassB(int a, int b)
        : ptr1(new ClassA(a)), ptr2(new ClassA(b)) {} // có thể rò ptr1
    ~ClassB() { delete ptr1; delete ptr2; }
};
```

Dùng thành viên `unique_ptr`, đối tượng thành viên đã xây dựng xong sẽ được hủy nếu constructor sau đó thất bại:

```cpp
class ClassB {
    std::unique_ptr<ClassA> ptr1;
    std::unique_ptr<ClassA> ptr2;
public:
    ClassB(int a, int b)
        : ptr1(new ClassA(a)), ptr2(new ClassA(b)) {}

    ClassB(const ClassB& x)
        : ptr1(new ClassA(*x.ptr1)), ptr2(new ClassA(*x.ptr2)) {}

    ClassB& operator=(const ClassB& x) {
        *ptr1 = *x.ptr1;
        *ptr2 = *x.ptr2;
        return *this;
    }
    // destructor mặc định hủy các unique_ptr
};
```

Ví dụ giả sử cả hai con trỏ đều không rỗng và phần tử gán được. Nếu cần sao chép sâu, phải tự định nghĩa ngữ nghĩa copy như ví dụ; copy mặc định không thể copy `unique_ptr`. Các special member do người dùng khai báo cũng ảnh hưởng đến việc move có được sinh ngầm hay không; không nên mặc định lớp chắc chắn có move chỉ vì các thành viên move được. Phép gán từng phần tử trong ví dụ cũng có thể chỉ cập nhật một phần nếu phép gán sau ném ngoại lệ.

## Quản lý mảng

`unique_ptr<T>` mặc định dùng `delete`, không phù hợp với mảng được tạo bằng `new[]`:

```cpp
std::unique_ptr<std::string> wrong(new std::string[10]); // SAI khi hủy
```

Dùng specialization `unique_ptr<T[]>`, có deleter mặc định gọi `delete[]`:

```cpp
std::unique_ptr<std::string[]> names(new std::string[10]);
names[0] = "Nico"; // operator[]
// *names;          // LỖI: specialization mảng không cung cấp operator*
```

Specialization mảng cung cấp `operator[]` thay cho `*` và `->`; lập trình viên vẫn phải bảo đảm chỉ số hợp lệ. Chuyển một mảng đối tượng dẫn xuất thành mảng lớp cơ sở không có ngữ nghĩa đa hình an toàn như chuyển một con trỏ đối tượng đơn; `unique_ptr` mảng không cho phép những chuyển đổi mảng dẫn xuất–cơ sở không an toàn như vậy.

:::note Góc nhìn hiện đại
Trong nhiều bài toán lưu một dãy phần tử, `std::vector<T>` còn cung cấp kích thước và các thao tác container. Nếu thật sự cần mảng động có quyền sở hữu độc quyền, C++14 hỗ trợ `std::make_unique<T[]>(n)`.
:::
