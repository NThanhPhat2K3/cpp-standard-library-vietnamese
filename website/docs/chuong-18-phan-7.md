---
id: chuong-18-phan-7
title: 'Chương 18 · Mutex và khóa RAII'
---

Phần này theo mục 18.5.1, trang 989–995. Mutex cung cấp cơ chế loại trừ lẫn nhau: một thread giữ mutex thì thread khác phải đợi hoặc không lấy được cùng mutex. Tất cả truy cập cạnh tranh tới dữ liệu được bảo vệ phải tuân theo cùng quy tắc khóa.

## `lock_guard`

`std::lock_guard<std::mutex>` khóa khi tạo và tự mở khóa khi hủy, kể cả khi rời scope do ngoại lệ. Dùng scope để giới hạn thời gian giữ khóa, nhưng phải giữ toàn bộ thao tác cần nhất quán trong cùng vùng bảo vệ.

```cpp
#include <cassert>
#include <mutex>
#include <thread>

int main() {
    std::mutex mutex;
    int count = 0;
    auto increment = [&] {
        for (int i = 0; i < 1000; ++i) {
            std::lock_guard<std::mutex> lock(mutex);
            ++count;
        }
    };
    std::thread worker(increment);
    increment();
    worker.join();
    assert(count == 2000);
}
```

Mutex bảo vệ tài nguyên theo quy ước của chương trình; nó không tự biết biến nào cần bảo vệ. Cần tránh giữ khóa khi gọi code không kiểm soát hoặc thực hiện thao tác lâu nếu thiết kế cho phép, để hạn chế chặn và deadlock.

## Recursive và timed mutex

`std::recursive_mutex` cho phép cùng thread khóa lại; cần mở khóa tương ứng mỗi lần đã khóa. Nó có thể hữu ích khi các hàm khóa gọi lẫn nhau, nhưng cũng có thể che khuất cấu trúc khóa phức tạp. Không gọi `lock()` lần nữa trên `std::mutex` thông thường mà thread hiện tại đang sở hữu: hành vi không đáp ứng điều kiện sử dụng.

`try_lock()` thử lấy mutex và có thể trả `false` ngay cả khi mutex dường như rảnh. `std::timed_mutex` và `std::recursive_timed_mutex` có thêm `try_lock_for`/`try_lock_until`. Sau khi đã khóa thành công bằng tay, `lock_guard(m, std::adopt_lock)` nhận trách nhiệm mở khóa; chỉ dùng `adopt_lock` khi thread hiện tại **đã sở hữu** mutex.

## Nhiều mutex

Khóa nhiều mutex theo thứ tự khác nhau có thể dẫn đến deadlock. `std::lock(m1, m2, ...)` áp dụng thuật toán tránh deadlock cho các mutex được truyền; nếu ném ngoại lệ, nó mở các mutex đã lấy trong lời gọi đó. Sau khi thành công, dùng guard với `adopt_lock`:

```cpp
#include <cassert>
#include <mutex>

int main() {
    std::mutex first, second;
    int a = 1, b = 2;
    {
        std::lock(first, second);
        std::lock_guard<std::mutex> lockFirst(first, std::adopt_lock);
        std::lock_guard<std::mutex> lockSecond(second, std::adopt_lock);
        ++a;
        ++b;
    }
    assert(a == 2 && b == 3);
}
```

`std::try_lock(m1, m2, ...)` thử theo thứ tự đối số; trả `-1` nếu lấy được tất cả, hoặc chỉ số mutex đầu tiên lấy không được và mở những mutex đã lấy trong lần thử. Không truyền cùng một mutex thông thường nhiều lần. C++17 bổ sung `std::scoped_lock` để quản lý nhiều mutex bằng RAII; sách tập trung giao diện C++11.

`std::unique_lock` linh hoạt hơn `lock_guard`, có thể trì hoãn khóa hoặc mở khóa trước khi hủy; mục tiếp theo bàn chi tiết. Không có cơ chế nào tự chứng minh toàn bộ chương trình không deadlock: còn phải xét mọi đường khóa và vòng đời tài nguyên.
