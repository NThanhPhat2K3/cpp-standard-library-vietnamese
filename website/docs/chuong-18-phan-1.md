---
id: chuong-18-phan-1
title: 'Chương 18 · Async và future'
---

Chương 18 giới thiệu concurrency trong C++11: chạy công việc, chuyển kết quả và ngoại lệ, đồng bộ truy cập dữ liệu bằng mutex, condition variable và atomic. Phần này theo mục 18.1.1, trang 945–951.

## Chạy công việc và lấy kết quả

`std::async` trong `<future>` nhận một callable và trả `std::future<T>` cho kết quả kiểu `T`. Future đại diện shared state chứa kết quả hoặc ngoại lệ. `get()` chờ khi cần và trả kết quả; với `future<void>`, `get()` chỉ chờ và truyền lại ngoại lệ nếu có.

```cpp
#include <cassert>
#include <future>

int first() { return 20; }
int second() { return 22; }

int main() {
    std::future<int> result = std::async(first);
    int foreground = second();
    int total = result.get() + foreground;
    assert(total == 42);
}
```

Không truyền launch policy, implementation có thể chọn chạy bất đồng bộ hoặc trì hoãn. Nếu chọn trì hoãn, lời gọi chờ không có timeout như `get()` hoặc `wait()` sẽ thực thi công việc; nếu future bị hủy mà chưa có lời gọi như vậy, công việc trì hoãn có thể không được gọi. Do đó mặc định không bảo đảm hai hàm chạy song song.

Gọi `get()` sau công việc độc lập giúp tạo cơ hội chồng lấp thời gian chạy; tuy nhiên tăng tốc thực tế còn phụ thuộc tài nguyên và chi phí. Tránh đặt `second() + result.get()` nếu cần chắc chắn `second()` được gọi trước khi chờ: thứ tự đánh giá các toán hạng có thể không như mong đợi.

## Launch policy

| Policy | Hành vi |
| --- | --- |
| `std::launch::async` | Yêu cầu chạy bất đồng bộ; nếu không thể tạo tài nguyên cần thiết, có thể ném `std::system_error`. |
| `std::launch::deferred` | Trì hoãn callable cho đến lời gọi chờ không timeout; nó chạy trong thread thực hiện lời gọi đó. |
| Mặc định | Cho phép implementation chọn giữa các policy chuẩn được hỗ trợ. |

```cpp
#include <cassert>
#include <future>

int main() {
    bool called = false;
    auto lazy = std::async(std::launch::deferred, [&called] {
        called = true;
        return 7;
    });
    assert(!called);
    const int value = lazy.get();
    assert(value == 7 && called);
}
```

Biến được capture bằng tham chiếu phải còn sống đến khi callable hoàn tất. Với policy async, nếu future là tham chiếu cuối tới shared state được tạo bởi `async`, việc giải phóng state có thể chờ task kết thúc. Vì vậy bỏ ngay future tạm có thể khiến biểu thức chờ và làm mất cơ hội chạy chồng lấp; giữ future và gọi `get()` rõ ràng khi cần kết quả.

## Ngoại lệ và an toàn dữ liệu

Ngoại lệ thoát khỏi callable được lưu trong shared state và được ném lại khi gọi `get()`. `wait()` chỉ đợi, không lấy kết quả. `future::get()` thông thường tiêu thụ shared state của future; không gọi `get()` lần hai trên cùng future. Các mục tiếp theo trình bày `shared_future` để chia sẻ kết quả.

Các task chỉ an toàn khi truy cập dữ liệu chung đúng quy tắc đồng bộ. Nếu hai thread truy cập cùng vùng nhớ, ít nhất một truy cập ghi và không có quan hệ đồng bộ thích hợp, chương trình có thể xảy ra data race và hành vi không xác định. Không suy ra thứ tự hoàn thành từ thứ tự bắt đầu.
