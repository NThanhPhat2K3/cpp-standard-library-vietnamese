---
id: chuong-18-phan-10
title: 'Chương 18 · Atomic cơ bản'
---

Phần này theo mục 18.7.1–18.7.3, trang 1012–1019. `<atomic>` cung cấp thao tác nguyên tử và các lựa chọn thứ tự bộ nhớ. Mặc định các thao tác dùng `memory_order_seq_cst`; tính nguyên tử của một biến không tự biến cả một chuỗi thao tác trên nhiều biến thành giao dịch nguyên tử.

## Đọc, ghi và cập nhật

| Thao tác | Kết quả |
| --- | --- |
| `store(value)` | Ghi giá trị nguyên tử. |
| `load()` | Đọc bản sao giá trị nguyên tử. |
| `exchange(value)` | Ghi giá trị mới, trả giá trị cũ. |
| `fetch_add`, `fetch_sub` | Cập nhật cộng/trừ và trả **giá trị cũ**. |
| `fetch_and`, `fetch_or`, `fetch_xor` | Cập nhật bit và trả giá trị cũ, với kiểu hỗ trợ. |
| `is_lock_free()` | Cho biết thao tác với đối tượng có lock-free theo implementation hay không. |

Các phép increment, decrement và compound assignment có trên những specialization thích hợp. Khởi tạo tường minh, ví dụ `std::atomic<int> count(0)`, là cách rõ ràng khi viết mã theo C++11. Atomic object không copy như một giá trị thông thường; dùng `load()` nếu cần bản sao giá trị.

Trong C++11, constructor mặc định của `atomic` không khởi tạo đầy đủ đối tượng để dùng cho các thao tác thông thường. Sách giới thiệu `std::atomic_init(&a, value)` để khởi tạo trước khi chia sẻ giữa các thread; thao tác khởi tạo đó không tự là một phép đồng bộ. Khi viết ví dụ C++11, có thể tránh nhầm lẫn bằng cách khởi tạo trực tiếp với giá trị. Quy tắc default construction đã thay đổi từ C++20, nên không áp dụng máy móc mô tả lịch sử này cho mọi phiên bản.

:::note Đính chính bảng trong sách
Bảng 18.11 mô tả `fetch_add` và các `fetch_*` trả giá trị mới. Chúng trả **giá trị ngay trước cập nhật**; các toán tử prefix/postfix và compound assignment có quy tắc giá trị trả về riêng.
:::

```cpp
#include <atomic>
#include <cassert>
#include <thread>

int main() {
    std::atomic<int> counter(0);
    auto increment = [&] {
        for (int i = 0; i < 1000; ++i) counter.fetch_add(1);
    };
    std::thread worker(increment);
    increment();
    worker.join();
    assert(counter.load() == 2000);
    int previous = counter.fetch_add(5);
    assert(previous == 2000 && counter.load() == 2005);
}
```

`is_lock_free()` không hứa rằng code chắc chắn nhanh hơn mutex hay toàn bộ thuật toán là lock-free; nó nói về các thao tác atomic của đối tượng theo implementation.

Các toán tử tiện dụng có giá trị trả về khác nhau. Với `std::atomic<int> a(5)`, `a.fetch_add(1)` và `a++` trả giá trị trước khi tăng, còn `++a` và `a += 1` trả giá trị sau cập nhật. Gán `a = value` trả bản sao giá trị được gán, không trả tham chiếu tới đối tượng atomic. Các thao tác riêng lẻ là atomic; biểu thức kết hợp nhiều thao tác vẫn có thể xen kẽ với thread khác.

```cpp
#include <atomic>
#include <cassert>

int main() {
    std::atomic<int> a(5);
    assert(a.fetch_add(1) == 5); // a là 6
    assert(a++ == 6);            // a là 7
    assert(++a == 8);
    assert((a += 2) == 10);
    assert((a = 3) == 3);
}
```

## Compare-and-exchange

`compare_exchange_strong(expected, desired)` so sánh giá trị atomic với `expected`: nếu khớp, cập nhật thành `desired` và trả `true`; nếu không, cập nhật `expected` bằng giá trị quan sát được và trả `false`. `compare_exchange_weak` có thể thất bại giả, nên thường dùng trong vòng lặp.

```cpp
#include <atomic>
#include <cassert>

int main() {
    std::atomic<int> value(5);
    int expected = 5;
    while (!value.compare_exchange_weak(expected, expected + 1)) {
        // expected được cập nhật nếu giá trị không còn khớp
    }
    assert(value.load() == 6);
}
```

Khi giá trị mới phụ thuộc giá trị cũ, phải tính lại nó sau mỗi lần thất bại. Thao tác CAS là một phép atomic duy nhất; mã giả gồm `load()` rồi `store()` riêng không tương đương khi có thread khác.

## Công bố dữ liệu và API C-style

Store/load mặc định có thứ tự sequentially consistent. Khi load quan sát store phù hợp, chúng cũng có thể thiết lập đồng bộ để công bố dữ liệu được ghi trước store; ví dụ release/acquire được trình bày ở [phần data race](./chuong-18-phan-6.md). Không dùng một cờ atomic để giả định mọi lần sửa dữ liệu khác đều an toàn nếu giao thức không bảo vệ chúng.

Ví dụ ở trang 1015 dùng một cờ để báo rằng dữ liệu đã sẵn sàng. Phiên bản dưới đây bỏ phần chờ người dùng nhập, nhưng giữ cách công bố bằng `store` và chờ bằng `load` mặc định:

```cpp
#include <atomic>
#include <cassert>
#include <chrono>
#include <thread>

int main() {
    int data = 0;
    std::atomic<bool> ready(false);
    std::thread producer([&] {
        data = 42;
        ready.store(true);
    });
    std::thread consumer([&] {
        while (!ready.load())
            std::this_thread::sleep_for(std::chrono::milliseconds(1));
        assert(data == 42);
    });
    producer.join();
    consumer.join();
}
```

Khi `load()` đọc được `true` từ `store()`, phép ghi `data` trước `store` xảy ra trước phép đọc `data` sau `load` theo quan hệ đồng bộ. Ở đây producer không tiếp tục sửa `data` trong khi consumer đọc; nếu có những lần sửa khác, chúng cần giao thức đồng bộ riêng. `sleep_for` chỉ giảm tần suất kiểm tra, không tạo ra bảo đảm đồng bộ; polling cũng có thể làm consumer phản ứng chậm hơn hoặc tốn tài nguyên.

Sách nhắc rằng chờ bằng condition variable vẫn cần mutex. Một cờ atomic riêng không thay thế giao thức mutex của condition variable: nếu producer đổi cờ và thông báo mà không phối hợp qua cùng mutex, notification có thể xảy ra sau lần kiểm tra predicate nhưng trước khi consumer thực sự chờ. Xem cách bảo vệ predicate và chờ phối hợp ở [phần condition variable](./chuong-18-phan-9.md).

Các alias như `std::atomic_bool`, `std::atomic_int` và hàm `std::atomic_store`, `std::atomic_load` cung cấp giao diện kiểu C. Sách bàn thêm atomic operations cho `shared_ptr` của C++11; các phiên bản C++ mới bổ sung giao diện khác nên cần xét đúng phiên bản.

Một số tên kiểu trong bảng 18.12 của sách:

| Tên | Kiểu tương ứng |
| --- | --- |
| `atomic_bool` | `atomic<bool>` |
| `atomic_char`, `atomic_uchar` | `atomic<char>`, `atomic<unsigned char>` |
| `atomic_short`, `atomic_ushort` | `atomic<short>`, `atomic<unsigned short>` |
| `atomic_int`, `atomic_uint` | `atomic<int>`, `atomic<unsigned int>` |
| `atomic_long`, `atomic_ulong` | `atomic<long>`, `atomic<unsigned long>` |
| `atomic_llong`, `atomic_ullong` | `atomic<long long>`, `atomic<unsigned long long>` |
| `atomic_size_t`, `atomic_ptrdiff_t` | `atomic<size_t>`, `atomic<ptrdiff_t>` |

Các tên trên nằm trong namespace `std`; sách còn liệt kê các alias cho kiểu ký tự rộng và số nguyên kích thước cố định. Giao diện hàm tự do nhận con trỏ, chẳng hạn `std::atomic_store(&flag, true)` và `std::atomic_load(&flag)`; cách gọi hàm tự do không làm thay đổi yêu cầu về lifetime hay thứ tự bộ nhớ.

Trong C++11, các hàm tự do `atomic_load` và `atomic_store` có overload dành cho `shared_ptr`, cho phép các thread truy cập **cùng một đối tượng `shared_ptr`** qua những hàm đó. Chúng bảo vệ việc đọc/ghi con trỏ sở hữu, không tự đồng bộ việc đọc/ghi đối tượng mà con trỏ trỏ tới. Từ C++20 có specialization `std::atomic<std::shared_ptr<T>>`; sách viết trước thay đổi này.
