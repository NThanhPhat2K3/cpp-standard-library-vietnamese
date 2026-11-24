---
id: chuong-03-phan-5
title: 'Chương 3 · decltype, enum và các tính năng trước C++11'
sidebar_label: '03 · Phần 5: decltype, enum và tính năng cũ'
---

# 3.1.11–3.2.2 · Các tính năng ngôn ngữ còn lại

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 32–38 (PDF trang 61–67). Các hộp “Góc nhìn hiện đại” là phần bổ sung hoặc đính chính.

## 3.1.11 Từ khóa `decltype`

`decltype` cho phép trình biên dịch xác định kiểu của một biểu thức. Đây là lời đáp cho nhu cầu thường được gọi là `typeof`, nhưng các bản triển khai `typeof` trước đó không nhất quán và không đầy đủ, nên C++11 đưa vào một từ khóa mới:

```cpp
std::map<std::string, float> coll;
decltype(coll)::value_type elem;
```

`decltype` được dùng, chẳng hạn, để khai báo kiểu trả về, lập trình siêu dữ liệu (*metaprogramming*), hoặc chỉ định kiểu của một lambda. Sách trở lại các ứng dụng này ở mục 5.4.1 và 10.3.4.

:::note Góc nhìn hiện đại
Quy tắc của `decltype` phụ thuộc vào hình thức và loại giá trị của biểu thức. Ví dụ, với biến `int x`, `decltype(x)` là `int` nhưng `decltype((x))` là `int&` vì `(x)` là một biểu thức lvalue. Hãy chú ý ngoặc khi dùng trong mã tổng quát.
:::

## 3.1.12 Cú pháp khai báo hàm mới

Đôi khi kiểu trả về phụ thuộc một biểu thức dùng các tham số. Cách viết sau không hợp lệ vì tại vị trí kiểu trả về, `x` và `y` chưa được khai báo trong phạm vi phù hợp:

```cpp
template <typename T1, typename T2>
decltype(x + y) add(T1 x, T2 y); // LỖI: x, y chưa có trong phạm vi
```

C++11 cho phép đặt kiểu trả về sau danh sách tham số:

```cpp
template <typename T1, typename T2>
auto add(T1 x, T2 y) -> decltype(x + y);
```

Đây là cú pháp kiểu trả về phía sau (*trailing return type*), giống cách chỉ định kiểu trả về của lambda ở mục 3.1.10.

Khi định nghĩa hàm, kiểu được suy ra từ biểu thức cộng theo các quy tắc thông thường của C++; nó không nhất thiết trùng với kiểu của một trong hai tham số:

```cpp
#include <cassert>
#include <type_traits>

template <typename T1, typename T2>
auto add(T1 x, T2 y) -> decltype(x + y) {
    return x + y;
}

int main() {
    static_assert(std::is_same<decltype(add(1, 2.5)), double>::value,
                  "int + double cho ket qua double");
    assert(add(1, 2.5) == 3.5);
}
```

Ví dụ dùng `std::is_same` để kiểm tra kiểu ngay lúc biên dịch. Với kiểu do người dùng định nghĩa, lời gọi chỉ hợp lệ nếu biểu thức `x + y` có nghĩa đối với hai kiểu đối số đó. Phần định nghĩa hàm cũng phải thực hiện được phép cộng tương ứng.

## 3.1.13 Scoped enumeration

C++11 cho phép định nghĩa *scoped enumeration*, còn gọi là *strong enumeration* hoặc *enumeration class*:

```cpp
enum class Salutation : char { mr, ms, co, none };
```

Điểm quan trọng là từ khóa `class` sau `enum`. Các lợi ích sách nêu gồm:

- Không có chuyển đổi ngầm giữa scoped enum và `int`.
- Các enumerator như `mr` không được đưa vào phạm vi bao quanh; phải viết `Salutation::mr`.
- Có thể chỉ định kiểu nền (*underlying type*), ở đây là `char`; nếu bỏ `: char`, kiểu nền mặc định là `int`.
- Có thể khai báo trước kiểu enum, giúp các đơn vị dịch chỉ cần biết kiểu không phải phụ thuộc vào toàn bộ danh sách enumerator.

Type trait `std::underlying_type` cho phép xác định kiểu nền của một enum; xem mục 5.4.2. Theo sách, các giá trị điều kiện lỗi của ngoại lệ chuẩn là một ví dụ sử dụng scoped enum; xem mục 4.3.2.

:::note Góc nhìn hiện đại
Khai báo trước và định nghĩa sau phải thống nhất kiểu nền. Khả năng tránh biên dịch lại còn phụ thuộc vào việc tổ chức header và phụ thuộc thực tế của dự án.
:::

## 3.1.14 Các kiểu dữ liệu cơ bản mới

C++11 bổ sung các kiểu cơ bản sau:

- `char16_t` và `char32_t`, được bàn thêm ở mục 16.1.3.
- `long long` và `unsigned long long`.
- `std::nullptr_t`, đã giới thiệu ở mục 3.1.1.

## 3.2 Những tính năng “mới” đã có từ trước

Tại thời điểm viết sách, C++98 đã hơn mười năm tuổi, nhưng một số tính năng của nó vẫn có thể khiến lập trình viên bất ngờ. Phần này giới thiệu một số tính năng như vậy.

### Tham số template phi kiểu

Ngoài tham số kiểu, template có thể nhận tham số phi kiểu (*nontype template parameter*). Giá trị đối số góp phần xác định kiểu của specialization. Ví dụ, `std::bitset<>` nhận số bit làm đối số template:

```cpp
std::bitset<32> flags32; // 32 bit
std::bitset<50> flags50; // 50 bit
```

Hai đối tượng có kiểu khác nhau do đối số template khác nhau. Không thể trực tiếp gán hoặc so sánh chúng trừ khi có chuyển đổi hoặc phép toán phù hợp. Sách nói thêm về `bitset` ở mục 12.5.

### Đối số template mặc định

Class template có thể có đối số mặc định:

```cpp
template <typename T, typename Container = std::vector<T>>
class MyClass;

MyClass<int> x1; // tương đương MyClass<int, std::vector<int>>
```

Đối số mặc định có thể được định nghĩa dựa trên những tham số xuất hiện trước. Ví dụ này chỉ minh họa khai báo template; muốn tạo `x1`, chương trình cần có định nghĩa đầy đủ của lớp.

### Từ khóa `typename`

`typename` có thể chỉ ra rằng một tên phụ thuộc là tên kiểu:

```cpp
template <typename T>
class MyClass {
    typename T::SubType* ptr;
};
```

Ở đây `ptr` là con trỏ tới kiểu lồng bên trong `T` có tên `SubType`. Khi không có `typename`, một tên phụ thuộc như `T::SubType` nhìn chung không tự được hiểu là kiểu; trong một ngữ cảnh biểu thức, `T::SubType * ptr` có thể được phân tích như phép nhân.

Kiểu thay cho `T` phải cung cấp kiểu lồng thích hợp. Ví dụ sau dùng `public` để `MyClass` có quyền truy cập:

```cpp
class Q {
public:
    typedef int SubType;
};
MyClass<Q> x; // ptr có kiểu int*
```

`SubType` cũng có thể là một kiểu lớp. Ngoài vai trò trên, `typename` có thể thay `class` trong danh sách tham số template: `template <typename T> class MyClass;`.

:::note Góc nhìn hiện đại
Quy tắc sách diễn đạt rằng mọi tên template đều cần `typename` khi là kiểu là cách đơn giản hóa. Có nhiều ngoại lệ và ngữ cảnh đã biết đó là kiểu; các phiên bản C++ mới cũng mở rộng những ngữ cảnh có thể bỏ `typename`. Kiểm tra quy tắc tên phụ thuộc theo vị trí cụ thể.
:::

### Member template

Hàm thành viên có thể là template, nhưng một member function template không thể là hàm `virtual`:

```cpp
class MyClass {
public:
    template <typename T>
    void f(T);
};
```

`f` biểu thị một họ hàm thành viên; đối số phải hỗ trợ những thao tác mà phần định nghĩa `f` sử dụng.

Member template thường được dùng để cho phép chuyển đổi giữa các specialization. Trước hết, xét cách chỉ nhận đúng specialization:

```cpp
template <typename T>
class MyClass {
    T value{};
public:
    void assign(const MyClass<T>& x) { value = x.value; }
};

MyClass<double> d;
MyClass<int> i;
d.assign(d); // hợp lệ
d.assign(i); // LỖI: cần MyClass<double>
```

Dù `int` có thể chuyển sang `double`, đối số `MyClass<int>` không tự trở thành `MyClass<double>`. Để nới lỏng, dùng một tham số template riêng cho hàm thành viên:

```cpp
template <typename T>
class MyClass {
    T value{};
public:
    template <typename X>
    void assign(const MyClass<X>& x) {
        value = x.getValue();
    }
    T getValue() const { return value; }
};

MyClass<double> d;
MyClass<int> i;
d.assign(d); // hợp lệ
d.assign(i); // hợp lệ: int có thể gán cho double
```

Các specialization khác nhau là các lớp khác nhau; trong ví dụ này `assign()` dùng hàm công khai `getValue()` thay vì truy cập trực tiếp thành viên private của specialization khác. `value{}` khởi tạo thành viên trước khi nó được đọc trong ví dụ; phép gán giữa hai kiểu cũng phải hợp lệ.

Một dạng đặc biệt là **constructor template**, thường hỗ trợ chuyển đổi giữa các specialization khi tạo đối tượng:

```cpp
template <typename T>
class MyClass {
public:
    MyClass();
    template <typename U>
    MyClass(const MyClass<U>& x);
};

MyClass<double> xd;
MyClass<double> xd2(xd); // copy constructor được sinh ngầm
MyClass<int> xi(xd);     // constructor template
```

Constructor template không ngăn việc khai báo ngầm copy constructor. Với ví dụ trên, khi kiểu khớp chính xác, copy constructor ngầm được dùng; khi specialization khác, constructor template có thể được chọn nếu đáp ứng điều kiện. Sách nhắc kiểm tra nhu cầu cung cấp constructor mặc định: một constructor do người dùng khai báo có thể khiến default constructor không tự được khai báo. Mục 5.1.1 có thêm ví dụ về member template.

:::note Góc nhìn hiện đại
Các constructor template và copy/move constructor tương tác theo quy tắc overload resolution; không nên suy rộng rằng copy constructor luôn thắng mọi constructor template trong mọi biến thể chữ ký. Ở ví dụ cụ thể trên, nhận `const MyClass<U>&` cho kết quả được mô tả.
:::

### Nested class template

Lớp lồng cũng có thể là template:

```cpp
template <typename T>
class MyClass {
    template <typename T2>
    class NestedClass;
};
```

### 3.2.1 Khởi tạo tường minh cho kiểu cơ bản

Cú pháp tạo giá trị không có đối số khởi tạo kiểu cơ bản về không:

```cpp
int i1;         // giá trị chưa xác định nếu là biến cục bộ thông thường
int i2 = int(); // 0
int i3{};       // 0, từ C++11
```

Điều này hữu ích trong template khi cần khởi tạo một giá trị mặc định:

```cpp
template <typename T>
void f() {
    T x = T(); // với kiểu số cơ bản, x được khởi tạo bằng 0
    // ...
}
```

Sách phân biệt *zero-initialization* với *default-initialization*. Trong ví dụ `T()`, cơ chế là *value-initialization*: kết quả cụ thể phụ thuộc loại `T`; với kiểu số cơ bản, nó cho giá trị không. Không nên hiểu rằng mọi kiểu lớp đều được khởi tạo giống hệt một số nguyên.

### 3.2.2 Định nghĩa `main()`

Trong môi trường hosted, hai dạng định nghĩa `main` chuẩn và có thể chuyển đổi là:

```cpp
int main() {
    // ...
}
```

và:

```cpp
int main(int argc, char* argv[]) {
    // ...
}
```

`argv` cũng có thể khai báo là `char**`. Kiểu trả về phải là `int`. Sách nhấn mạnh hai dạng chuẩn này để tránh các định nghĩa không di động.

Không bắt buộc viết `return` ở cuối `main`: đi đến cuối thân hàm có hiệu ứng như `return 0;`, biểu thị thành công. Sách mô tả giá trị khác không là một dạng thất bại và dẫn tới mục 5.8.2 để xem các giá trị định sẵn; vì vậy các ví dụ của tác giả thường không viết `return` ở cuối `main`.

Để kết thúc chương trình mà không trở về từ `main`, sách nêu `exit()`, `quick_exit()` (từ C++11) và `terminate()`; xem mục 5.8.2 để hiểu hành vi của từng cách.

:::note Góc nhìn hiện đại
Chuẩn cho phép implementation hỗ trợ thêm các dạng `main` khác; chúng không phải dạng di động được đảm bảo. Môi trường *freestanding* có quy tắc khởi động riêng. `exit`, `quick_exit` và `std::terminate` không giống nhau về dọn dẹp và xử lý kết thúc, nên cần chọn theo hành vi mong muốn.
:::
