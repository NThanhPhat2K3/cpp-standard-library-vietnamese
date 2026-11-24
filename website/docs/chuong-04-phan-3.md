---
id: chuong-04-phan-3
title: 'Chương 4 · Ngoại lệ, callable, concurrency và allocator'
sidebar_label: '04 · Phần 3: Callable, concurrency, allocator'
---

# 4.3.3–4.6 · Ngoại lệ và các khái niệm chung

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 52–57 (PDF trang 81–86). Các hộp “Góc nhìn hiện đại” và “Đính chính” là phần bổ sung.

## 4.3.3 Truyền ngoại lệ bằng `exception_ptr`

Từ C++11, thư viện cho phép lưu ngoại lệ trong `std::exception_ptr` để xử lý sau hoặc trong một ngữ cảnh khác:

```cpp
#include <exception>

std::exception_ptr eptr; // rỗng hoặc tham chiếu đến một ngoại lệ

void foo() {
    try {
        // ... thao tác có thể ném ngoại lệ
    } catch (...) {
        eptr = std::current_exception();
    }
}

void bar() {
    if (eptr != nullptr) {
        std::rethrow_exception(eptr);
    }
}
```

`std::current_exception()` trả về một `exception_ptr` tham chiếu ngoại lệ hiện đang được xử lý. Ngoại lệ được giữ sống khi còn `exception_ptr` sở hữu tham chiếu thích hợp. `std::rethrow_exception()` ném lại ngoại lệ được lưu, để nơi gọi `bar()` có thể bắt nó. Cơ chế này đặc biệt hữu ích khi chuyển ngoại lệ giữa các luồng; xem mục 18.2.1.

:::note Góc nhìn hiện đại
Bản thân ví dụ dùng một biến toàn cục để minh họa; nếu các luồng đọc và ghi **cùng biến** `eptr`, cần đồng bộ việc truy cập đó. `std::rethrow_exception` cần một `exception_ptr` không rỗng.
:::

Ví dụ hoàn chỉnh sau chuyển lỗi từ worker về luồng gọi. `join()` bảo đảm worker kết thúc trước khi luồng chính đọc `error`, nên hai truy cập vào biến này được sắp thứ tự:

```cpp
#include <cassert>
#include <exception>
#include <stdexcept>
#include <thread>

int main() {
    std::exception_ptr error;
    std::thread worker([&] {
        try {
            throw std::runtime_error("worker failed");
        } catch (...) {
            error = std::current_exception();
        }
    });
    worker.join();

    bool caught = false;
    if (error) {
        try {
            std::rethrow_exception(error);
        } catch (const std::runtime_error&) {
            caught = true;
        }
    }
    assert(caught);
}
```

Ngoại lệ phải được bắt bên trong hàm chạy trên thread; nếu thoát khỏi hàm đó, `std::terminate` được gọi. Nếu worker thành công, `error` vẫn rỗng và không gọi `rethrow_exception`. Không thể bỏ `join()` rồi đọc `error` đồng thời mà không thay bằng cơ chế đồng bộ khác. Bên ngoài quá trình xử lý ngoại lệ, `current_exception()` có thể trả `exception_ptr` rỗng.

## 4.3.4 Ném ngoại lệ chuẩn

Ta có thể ném các ngoại lệ chuẩn trong chương trình hoặc thư viện của mình. Các lớp lỗi logic và runtime thông thường nhận chuỗi mô tả khi tạo đối tượng; văn bản này được dùng bởi cơ chế `what()`:

```cpp
// Minh họa giao diện
namespace std {
    class logic_error : public exception {
    public:
        explicit logic_error(const string& whatString);
        explicit logic_error(const char* whatString); // từ C++11
    };
}
```

`std::system_error` cho phép tạo ngoại lệ từ `error_code`, thông điệp và, ở một số overload, số lỗi cùng category:

```cpp
// Minh họa các overload được sách nêu
system_error(error_code ec, const string& what_arg);
system_error(error_code ec, const char* what_arg);
system_error(error_code ec);
system_error(int ev, const error_category& ecat, const string& what_arg);
system_error(int ev, const error_category& ecat, const char* what_arg);
```

Có các hàm `make_error_code()` tiện dụng để tạo `error_code` từ giá trị enum thích hợp. `ios_base::failure` có constructor nhận chuỗi `what()` và, từ C++11, có thể nhận `error_code`. Sách cũng mô tả constructor của `future_error` liên quan tới mã lỗi future.

Ví dụ:

```cpp
throw std::out_of_range("out_of_range (somewhere, somehow)");

throw std::system_error(
    std::make_error_code(std::errc::invalid_argument),
    "argument ... is not valid");
```

:::warning Đính chính
Sách nói không thể ném `std::exception` và các lớp hỗ trợ ngôn ngữ như `std::bad_cast`; phát biểu đó không đúng theo nghĩa cú pháp chung: có thể tạo và ném các đối tượng đó khi constructor khả dụng. Tuy nhiên, nên chọn kiểu diễn đạt đúng lỗi và không giả định các lớp này có constructor nhận thông điệp tùy ý. `std::future_error` có constructor công khai nhận `std::future_errc` trong C++11; không nên dựa vào mô tả của sách rằng một overload nhận `error_code` là giao diện công khai di động.
:::

## 4.3.5 Dẫn xuất từ lớp ngoại lệ chuẩn

Có thể định nghĩa ngoại lệ riêng dẫn xuất trực tiếp hoặc gián tiếp từ `std::exception`. Khi làm vậy, cần bảo đảm thông tin lỗi được cung cấp qua `what()` hoặc cơ chế `code()` phù hợp. `what()` là hàm ảo nên lớp dẫn xuất có thể định nghĩa thông điệp riêng. Sách nêu ví dụ lớp `Stack` ở mục 12.1.3.

## 4.4 Callable object

Thư viện chuẩn dùng thuật ngữ **callable object** cho những thực thể có thể được dùng để gọi một hành vi. Sách liệt kê:

- Hàm hoặc con trỏ hàm, với các đối số được truyền vào lời gọi.
- Con trỏ tới hàm thành viên, được gọi trên đối tượng phù hợp với đối số đầu tiên; các đối số còn lại được truyền cho hàm thành viên.
- Function object có `operator()`, được gọi với các đối số tương ứng.
- Lambda, về bản chất tạo ra một loại function object.

Ví dụ sau minh họa `std::bind` và `std::async` dùng các dạng callable:

```cpp
void func(int x, int y);
auto l = [](int x, int y) { /* ... */ };

class C {
public:
    void operator()(int x, int y) const;
    void memfunc(int x, int y) const;
};

C c;
std::shared_ptr<C> sp(new C);

std::bind(func, 77, 33)();          // func(77, 33)
std::bind(l, 77, 33)();             // l(77, 33)
std::bind(C(), 77, 33)();           // C::operator()(77, 33)
std::bind(&C::memfunc, c, 77, 33)();  // gọi trên bản sao c được bind
std::bind(&C::memfunc, sp, 77, 33)(); // sp->memfunc(77, 33)

std::async(func, 42, 77);
std::async(l, 42, 77);
std::async(c, 42, 77);
std::async(&C::memfunc, &c, 42, 77);
std::async(&C::memfunc, sp, 42, 77);
```

Smart pointer cũng có thể cung cấp đối tượng đích của hàm thành viên. Sách thảo luận `std::bind` ở mục 10.2.2, `std::async` ở mục 18.1 và `std::function<>` — một wrapper cho callable theo chữ ký — ở mục 5.4.4. Để chạy ví dụ cần định nghĩa `func`, các hàm của `C` và include `<functional>`, `<future>`, `<memory>`.

:::note Góc nhìn hiện đại
`std::bind` thường lưu bản sao đối số; muốn tham chiếu đến `c`, có thể dùng `std::ref(c)` khi thời hạn sống cho phép. `std::async` với chính sách mặc định có thể chọn chạy trì hoãn; nếu future tạm được hủy ngay, lời gọi được chạy bất đồng bộ có thể phải chờ khi hủy. Đừng dựa vào các dòng minh họa trên để kết luận chắc chắn chúng chạy song song.
:::

## 4.5 Xử lý đồng thời và đa luồng

Trước C++11, chuẩn ngôn ngữ và thư viện chưa hỗ trợ concurrency theo cách hiện nay, dù implementation có thể cung cấp các bảo đảm riêng. C++11 bổ sung hỗ trợ ở cả hai phía.

Về ngôn ngữ, sách nêu:

- Mô hình bộ nhớ giúp việc cập nhật các đối tượng riêng biệt từ các luồng riêng biệt có thể được xét độc lập, theo những quy tắc về memory location và data race.
- Từ khóa `thread_local` hỗ trợ biến và đối tượng riêng cho từng luồng.

Thư viện bổ sung các bảo đảm an toàn luồng và các lớp, hàm để khởi chạy và đồng bộ nhiều luồng. Chương 18 đi sâu vào chúng; ở đây là các bảo đảm tổng quát được sách nêu.

### Các bảo đảm tổng quát

Khi nhiều luồng chia sẻ một đối tượng thư viện và ít nhất một luồng sửa đổi đối tượng, cần đồng bộ phù hợp hoặc dựa vào bảo đảm chia sẻ cụ thể của kiểu đó; nếu không có thể xảy ra data race và hành vi không xác định. Tương tự, không được để một luồng dùng đối tượng khi việc xây dựng chưa hoàn tất hoặc sau/khi việc hủy bắt đầu mà không có đồng bộ và quy tắc thời hạn sống phù hợp — kể cả đối tượng dùng để đồng bộ.

Những trường hợp sách nêu được hỗ trợ gồm:

- Với STL container và container adapter, nhiều luồng có thể truy cập chỉ đọc đồng thời. Một số hàm thành viên như `begin`, `end`, `rbegin`, `rend`, `front`, `back`, `data`, `find`, `lower_bound`, `upper_bound`, `equal_range`, `at`, và `operator[]` trừ associative container được xem là const cho mục đích tránh data race; iterator cũng có thể được dùng nếu không gây xung đột sửa đổi.
- Các luồng có thể đồng thời truy cập những **phần tử khác nhau** của cùng container, kể cả sửa đổi từng phần tử, ngoại trừ `vector<bool>` do các bit có thể dùng chung đơn vị lưu trữ.
- Đọc/ghi định dạng đồng thời trên các standard stream được đồng bộ với C I/O được hỗ trợ, nhưng ký tự có thể xen kẽ. Sách nêu `cin`, `cout`, `cerr`; không mặc định áp dụng bảo đảm tương tự cho mọi string stream, file stream hoặc stream buffer.
- Các lời gọi đồng thời tới `atexit`, `at_quick_exit`, các hàm đặt/lấy handler cấp phát hoặc kết thúc và `getenv` có những bảo đảm đồng bộ theo điều kiện chuẩn; xem mục 5.8.2.
- Các hàm thành viên của default allocator, trừ destructor theo cách diễn đạt trong sách, được đồng bộ cho truy cập đồng thời.

Thư viện cũng phải tránh những tác dụng phụ ẩn làm hỏng việc truy cập đồng thời đến đối tượng riêng biệt: không tùy tiện truy cập đối tượng liên quan ngoài những đối tượng cần thiết cho thao tác; không tạo dữ liệu tĩnh dùng chung thiếu đồng bộ; và việc song song hóa nội bộ phải tôn trọng các giới hạn về tác dụng phụ quan sát được. Sách dẫn thêm mục 18.4.2.

:::warning Phạm vi bảo đảm
Sửa các phần tử khác nhau không cho phép đồng thời thay đổi cấu trúc container một cách tùy ý: thao tác như `push_back`, `erase` hoặc tái cấp phát có thể ảnh hưởng toàn container và iterator. Dữ liệu mà các phần tử cùng tham chiếu cũng cần được đồng bộ riêng. Mọi bảo đảm đều có điều kiện và ngoại lệ cụ thể theo từng API.
:::

## 4.6 Allocator

Ở nhiều nơi, thư viện chuẩn dùng các đối tượng đặc biệt để xử lý cấp phát và giải phóng bộ nhớ; đó là **allocator**. Chúng biểu diễn một mô hình bộ nhớ và tạo lớp trừu tượng giữa nhu cầu lưu trữ của thành phần thư viện với lời gọi cấp phát cụ thể. Dùng allocator khác nhau cho phép một chương trình áp dụng nhiều mô hình bộ nhớ.

Ban đầu allocator được đưa vào STL để xử lý những kiểu con trỏ PC khác nhau như near, far và huge. Sách mô tả các ứng dụng tiếp theo như bộ nhớ chia sẻ, garbage collection hoặc cơ sở dữ liệu hướng đối tượng mà không cần thay đổi giao diện container; vào thời điểm viết sách, các cách dùng này còn tương đối mới.

Default allocator có dạng:

```cpp
namespace std {
    template <typename T>
    class allocator;
}
```

Nó là lựa chọn mặc định ở những nơi thư viện nhận allocator. Nó phục vụ cấp phát và giải phóng thông thường; thời điểm và số lần các lời gọi cấp phát thực sự xảy ra không nên bị giả định chỉ từ một thao tác container. Implementation có thể có chiến lược quản lý bộ nhớ riêng.

Phần lớn chương trình dùng allocator mặc định; một số thư viện cung cấp allocator chuyên biệt và ta có thể truyền chúng làm đối số khi cần. Việc tự viết allocator chỉ phù hợp trong một số trường hợp. Chương 19 trình bày chi tiết allocator và giao diện của chúng.

:::note Góc nhìn hiện đại
Chi tiết `std::allocator` và quy tắc dùng `operator new`/`operator delete` thay đổi theo phiên bản chuẩn. Từ C++17, thư viện còn có `std::pmr` để tách lựa chọn memory resource khỏi kiểu container; việc đó không thay thế nhu cầu hiểu thời hạn sống của resource và đối tượng.
:::
