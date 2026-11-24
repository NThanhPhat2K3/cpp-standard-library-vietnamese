---
id: chuong-18-phan-8
title: 'Chương 18 · Unique lock và call once'
---

Phần này theo mục 18.5.1–18.5.3, trang 996–1002. `unique_lock` quản lý quyền sở hữu mutex linh hoạt hơn `lock_guard`; `call_once` hỗ trợ khởi tạo một lần khi nhiều thread cùng cần dữ liệu.

## `unique_lock`

Một `std::unique_lock<Mutex>` có thể không gắn mutex, gắn nhưng chưa khóa, hoặc đang sở hữu mutex. Destructor mở khóa nếu nó đang sở hữu. Nó move được nhưng không copy được.

| Cách tạo hoặc thao tác | Ý nghĩa |
| --- | --- |
| `unique_lock<mutex> l(m)` | Gắn và khóa `m`. |
| `l(m, std::defer_lock)` | Gắn `m` nhưng chưa khóa. |
| `l(m, std::try_to_lock)` | Thử khóa không chặn; kiểm tra `owns_lock()`. |
| `l(m, std::adopt_lock)` | Nhận mutex đã được thread hiện tại khóa. |
| Constructor nhận duration/time point | Thử khóa timed mutex theo thời hạn. |
| `lock`, `try_lock`, `unlock` | Điều khiển việc sở hữu; các thao tác có điều kiện sử dụng riêng. |
| `owns_lock()`, `operator bool`, `mutex()` | Kiểm tra quyền sở hữu và mutex liên kết. |
| `release()` | Bỏ liên kết và trả con trỏ mutex; **không mở khóa**. |

Nếu gọi `release()` khi đang giữ mutex, người gọi phải quản lý việc mở khóa sau đó. Không nhầm thao tác này với `unlock()`.

```cpp
#include <cassert>
#include <mutex>

int main() {
    std::mutex a, b;
    std::unique_lock<std::mutex> first(a, std::defer_lock);
    std::unique_lock<std::mutex> second(b, std::defer_lock);
    std::lock(first, second);
    assert(first.owns_lock() && second.owns_lock());
    // Cả hai tự mở khóa khi rời scope.
}
```

:::note Sửa ví dụ sách
Trang 997 tạo hai `unique_lock` với `defer_lock` nhưng sau đó gọi `std::lock(m1, m2)` trực tiếp. Khi đó hai `unique_lock` không biết chúng sở hữu khóa và sẽ không mở mutex. Gọi `std::lock(lockM1, lockM2)` như ví dụ trên, hoặc dùng `adopt_lock` sau khi khóa mutex trực tiếp.
:::

## Các loại mutex C++11

`mutex` và `recursive_mutex` hỗ trợ `lock`, `try_lock`, `unlock`; `timed_mutex` và `recursive_timed_mutex` thêm `try_lock_for`, `try_lock_until`. Recursive mutex cho phép cùng thread khóa nhiều lần và yêu cầu mở tương ứng. Thread phải sở hữu mutex khi mở khóa; không hủy mutex còn được sở hữu. Native handle, nếu dùng, phụ thuộc nền tảng.

Một thread cũng không được kết thúc khi còn sở hữu mutex. Khóa lại một mutex không đệ quy do chính thread đang giữ không phải cách chờ hợp lệ. `lock()` có thể ném `std::system_error` khi gặp lỗi hệ thống; chẳng hạn hệ thống có thể phát hiện nguy cơ deadlock. Với timed mutex, `try_lock_for` nhận một khoảng thời gian còn `try_lock_until` nhận một mốc thời gian: việc điều chỉnh đồng hồ hệ thống có thể ảnh hưởng đến cách chờ theo mốc.

Ngoài các thao tác trong bảng, `unique_lock` hỗ trợ move và `swap` để chuyển hoặc trao đổi trạng thái quản lý khóa. Sau khi move, đối tượng nguồn không còn gắn mutex; đối tượng nhận chịu trách nhiệm mở khóa nếu đang sở hữu. Các thao tác như `lock()` và `unlock()` có tiền điều kiện về mutex liên kết và trạng thái sở hữu; gọi sai có thể báo `std::system_error`.

## `call_once`

`std::call_once(flag, callable, args...)` dùng `std::once_flag` để bảo đảm một lần gọi thành công cho cùng flag. Nếu callable ném, ngoại lệ truyền về lời gọi đó và một lần gọi sau có thể thử lại. Sau lần thành công, các lời gọi khác cùng flag không chạy callable nữa; các tác dụng của lần thành công được công bố cho các lời gọi thụ động tương ứng.

```cpp
#include <cassert>
#include <mutex>
#include <thread>

int main() {
    std::once_flag flag;
    int value = 0;
    auto initialize = [&] { std::call_once(flag, [&] { value = 42; }); };
    std::thread worker(initialize);
    initialize();
    worker.join();
    assert(value == 42);
}
```

Không dùng Boolean thường để kiểm tra và khởi tạo đồng thời mà không đồng bộ. Với biến static cục bộ được khởi tạo trực tiếp, C++11 cũng có quy tắc khởi tạo an toàn giữa các thread; `call_once` hữu ích khi việc khởi tạo cần được kiểm soát riêng.

Flag xác định nhóm lời gọi, không phải tên callable: nếu nhiều lời gọi dùng cùng một flag nhưng truyền callable khác nhau, chỉ một lời gọi hoàn tất thành công thực hiện callable của nó; sau đó các callable khác cùng flag không chạy. Nếu một callable ném ngoại lệ, lời gọi đó chuyển ngoại lệ cho caller và flag vẫn cho phép một lời gọi khác thử lại. Vì việc thử lại có thể thực hiện lại các bước đã làm trước khi ném, phần khởi tạo cần tự xử lý trạng thái dở dang nếu cần.

Sách cũng minh họa gọi hàm thành viên với `call_once`. Một flag đặt trong mỗi đối tượng cho phép mỗi đối tượng khởi tạo dữ liệu của chính nó một lần:

```cpp
#include <cassert>
#include <mutex>
#include <thread>

class Cache {
    mutable std::once_flag flag;
    mutable int value = 0;

    void initialize() const { value = 42; }

public:
    int get() const {
        std::call_once(flag, &Cache::initialize, this);
        return value;
    }
};

int main() {
    Cache cache;
    std::thread worker([&] {
        const int value = cache.get();
        assert(value == 42);
    });
    const int value = cache.get();
    assert(value == 42);
    worker.join();
}
```

`mutable` cho phép hàm `get() const` thực hiện khởi tạo lười; đối tượng `cache` phải còn sống cho đến khi mọi thread sử dụng nó đã xong. Ví dụ chỉ đọc `value` sau `call_once` và không sửa lại nó về sau.
