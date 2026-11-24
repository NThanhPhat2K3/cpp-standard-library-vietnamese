---
id: chuong-05-phan-17
title: 'Chương 5 · Thời gian C và chờ bằng timer'
sidebar_label: '05 · Phần 17: Thời gian C và timer'
---

# 5.7.4–5.7.5 · Thời gian C và chờ bằng timer

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 157–160 (PDF trang 186–189). Các hộp ghi chú là phần bổ sung.

## 5.7.4 Các hàm ngày giờ C và POSIX

Header `<ctime>` cung cấp các kiểu và hàm thời gian của C trong namespace `std`, cùng các macro liên quan. POSIX cung cấp thêm API trên các hệ thống hỗ trợ POSIX; không phải mọi API POSIX đều là một phần của C++ chuẩn.

| Tên | Ý nghĩa |
|:---|:---|
| `std::clock_t` | Kiểu giá trị thời gian CPU do `std::clock()` trả về. |
| `std::time_t` | Kiểu biểu diễn thời điểm lịch. |
| `std::tm` | Cấu trúc thời gian lịch đã tách thành các trường. |
| `std::clock()` | Trả thời gian CPU theo đơn vị `1/CLOCKS_PER_SEC` giây, hoặc giá trị lỗi theo hợp đồng. |
| `std::time()` | Lấy thời gian lịch hiện tại dưới dạng `time_t`. |
| `std::difftime()` | Hiệu giữa hai giá trị `time_t` tính bằng giây, kiểu `double`. |
| `std::localtime()` | Chuyển `time_t` thành `tm` theo giờ địa phương. |
| `std::gmtime()` | Chuyển `time_t` thành `tm` theo UTC. |
| `std::asctime()` | Định dạng `tm` thành chuỗi lịch theo dạng xác định sẵn. |
| `std::strftime()` | Định dạng `tm` theo chuỗi định dạng do người dùng chỉ định. |
| `std::ctime()` | Chuyển `time_t` thành chuỗi giờ địa phương, tương tự `asctime(localtime(...))`. |
| `std::mktime()` | Chuyển `tm` giờ địa phương sang `time_t`, đồng thời chuẩn hóa và tính các trường như thứ trong tuần. |

*Bảng 5.25, trang 158.* `CLOCKS_PER_SEC` là macro, không phải tên trong namespace `std`. Sách lưu ý `time_t` thường biểu diễn giây từ Unix epoch, nhưng hợp đồng C/C++ không cho phép suy ra điều đó chỉ từ tên kiểu.

### Chuyển giữa time point và thời gian lịch

Sách minh họa chuyển `system_clock::time_point` sang `time_t` bằng `to_time_t`, rồi định dạng bằng `ctime`. Để đi chiều ngược lại, điền `std::tm` và gọi `mktime`:

```cpp
#include <chrono>
#include <ctime>
#include <stdexcept>

std::chrono::system_clock::time_point makeTimePoint(
    int year, int month, int day, int hour, int minute, int second = 0) {
    std::tm t{};
    t.tm_sec = second;
    t.tm_min = minute;
    t.tm_hour = hour;
    t.tm_mday = day;
    t.tm_mon = month - 1;    // 0–11
    t.tm_year = year - 1900;
    t.tm_isdst = -1;         // yêu cầu hệ thống xác định DST
    const std::time_t tt = std::mktime(&t);
    if (tt == std::time_t(-1)) {
        throw std::runtime_error("mktime khong bieu dien duoc thoi diem");
    }
    return std::chrono::system_clock::from_time_t(tt);
}
```

`mktime` diễn giải các trường theo múi giờ địa phương. Với `tm_isdst = -1`, nó cố xác định xem giờ mùa hè có hiệu lực. Ví dụ sách tạo 1/1/2010 00:00 và 23/5/2011 13:44 rồi in lại bằng `ctime`, nên đầu ra tương ứng với giờ địa phương của môi trường.

Chiều còn lại trong sách chuyển `time_point` thành chuỗi giờ địa phương. Phiên bản dưới kiểm tra kết quả trước khi sao chép chuỗi và chỉ xóa newline nếu thực sự có:

```cpp
#include <chrono>
#include <ctime>
#include <stdexcept>
#include <string>

std::string asLocalString(std::chrono::system_clock::time_point tp) {
    const std::time_t t = std::chrono::system_clock::to_time_t(tp);
    const char* raw = std::ctime(&t);
    if (!raw) throw std::runtime_error("khong dinh dang duoc thoi gian");
    std::string result(raw);
    if (!result.empty() && result.back() == '\n') result.pop_back();
    return result;
}
```

Chuỗi được sao chép vì vùng nhớ trả về có thể bị ghi đè bởi các lời gọi khác. Việc sao chép ngay không tự làm `std::ctime` an toàn khi nhiều thread cùng gọi các hàm dùng vùng nhớ chung; khi cần chạy đồng thời, chọn cơ chế đồng bộ hoặc API phù hợp nền tảng. Việc chuyển qua `time_t` cũng có thể làm mất độ phân giải của `time_point`.

:::warning Kiểm tra và chuẩn hóa ngày giờ
`mktime` có thể chuẩn hóa các trường ngoài khoảng thông thường thay vì từ chối; nếu cần xác nhận đầu vào là ngày giờ hợp lệ, hãy đối chiếu các trường sau chuẩn hóa và xét cả thời điểm mơ hồ/không tồn tại do đổi giờ mùa hè. Giá trị `(time_t)-1` là tín hiệu lỗi theo API, nhưng trên một số hệ thống cũng có thể biểu diễn một thời điểm hợp lệ; cách phân biệt cần dựa vào hợp đồng nền tảng. Các hàm như `ctime`, `localtime`, `gmtime` có thể trả null và dùng vùng nhớ tĩnh, nên phải kiểm tra lỗi và cân nhắc an toàn luồng.
:::

Để hiển thị UTC, sách dùng `std::asctime(std::gmtime(&t))`, với điều kiện từng lời gọi thành công. `mktime` chuẩn diễn giải **giờ địa phương**, không phải một hàm chuyển `tm` UTC sang `time_t`; API riêng như `timegm` không di động giữa mọi môi trường. Mục 16.4.3 của sách bàn thêm về locale khi đọc và ghi thời gian.

## 5.7.5 Chờ với timer

Duration và time point có thể dùng để chặn luồng hiện tại hoặc giới hạn thời gian chờ của mutex, condition variable và future:

| API | Kiểu đối số và mục đích |
|:---|:---|
| `std::this_thread::sleep_for(d)` | Chờ theo duration. |
| `std::this_thread::sleep_until(tp)` | Chờ đến time point. |
| `try_lock_for(d)`, `try_lock_until(tp)` | Giới hạn chờ của mutex có hỗ trợ timed locking. |
| `wait_for(d)`, `wait_until(tp)` | Giới hạn chờ cho condition variable hoặc future phù hợp. |

Tên kết thúc bằng `_for` nhận duration; `_until` nhận deadline. Ví dụ:

```cpp
#include <chrono>
#include <thread>

std::this_thread::sleep_for(std::chrono::seconds(10));
std::this_thread::sleep_until(
    std::chrono::system_clock::now() + std::chrono::seconds(10));
```

Hai cách biểu diễn khác nhau: deadline dựa trên `system_clock` có thể chịu ảnh hưởng nếu đồng hồ hệ thống được điều chỉnh. Nếu đồng hồ bị lùi hoặc tiến trong thời gian chờ, thời lượng thực tế có thể thay đổi. Với khoảng thời gian trôi qua, `sleep_for` hoặc deadline dùng `steady_clock` thường phù hợp hơn; sách lưu ý cách triển khai và phần cứng cũng ảnh hưởng hành vi.

```cpp
auto deadline = std::chrono::steady_clock::now() + std::chrono::seconds(10);
std::this_thread::sleep_until(deadline);
```

Timer không hứa đánh thức chính xác tuyệt đối tại deadline: lập lịch, độ phân giải và tải hệ thống có thể làm luồng tiếp tục muộn. Với condition variable, còn cần kiểm tra predicate trong vòng lặp hoặc dùng overload nhận predicate vì có thể có *spurious wakeup*; một số API chờ cũng có thể kết thúc vì điều kiện khác trước timeout.
