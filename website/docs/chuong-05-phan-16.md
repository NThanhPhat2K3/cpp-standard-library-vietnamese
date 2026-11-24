---
id: chuong-05-phan-16
title: 'Chương 5 · Clock và time point'
sidebar_label: '05 · Phần 16: Clock và time point'
---

# 5.7.3 · Clock và time point

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 149–157 (PDF trang 178–186). Các ghi chú bổ sung và đính chính được đánh dấu riêng.

## Clock và epoch

Một clock xác định epoch, chu kỳ tick và kiểu time point của nó; `Clock::now()` trả thời điểm hiện tại theo clock đó. Một time point biểu diễn một duration có thể dương hoặc âm so với epoch. Ví dụ, nếu epoch là 1/1/1970 thì 10 ngày sau epoch là 11/1/1970.

| Thành viên clock | Ý nghĩa |
|:---|:---|
| `Clock::duration` | Kiểu duration của clock. |
| `Clock::rep` | Kiểu biểu diễn số tick. |
| `Clock::period` | Kiểu ratio của một tick. |
| `Clock::time_point` | Kiểu time point. |
| `Clock::is_steady` | Có phải clock steady hay không. |
| `Clock::now()` | Trả time point hiện tại. |

*Bảng 5.23, trang 149.* Ba clock trong C++11:

- `system_clock`: đồng hồ thời gian hệ thống; có `to_time_t()` và `from_time_t()` để chuyển đổi với `std::time_t`.
- `steady_clock`: thời điểm không giảm khi thời gian vật lý tiến lên và tick theo nhịp ổn định; phù hợp đo khoảng thời gian.
- `high_resolution_clock`: clock có chu kỳ tick ngắn nhất do implementation cung cấp; có thể là alias của clock khác và không nhất thiết steady.

Sách nhấn mạnh rằng độ phân giải, miền giá trị và, trong bối cảnh C++11, epoch không được giả định giống nhau trên mọi hệ thống. Tên `period` mô tả **đơn vị tick**, không tự bảo đảm độ chính xác đo thực tế hoặc độ chính xác của đồng hồ so với thời gian bên ngoài.

Ví dụ dựa trên chương trình in thông tin clock của sách:

```cpp
#include <chrono>
#include <iostream>
#include <ratio>

template <typename Clock>
void printClockData() {
    using P = typename Clock::period;
    std::cout << "tick: " << P::num << '/' << P::den << " second\n";
    std::cout << "steady: " << std::boolalpha << Clock::is_steady << '\n';
}

int main() {
    printClockData<std::chrono::system_clock>();
    printClockData<std::chrono::high_resolution_clock>();
    printClockData<std::chrono::steady_clock>();
}
```

Sách đưa một kết quả ví dụ trong đó `system_clock` và `high_resolution_clock` có tick 100 ns, còn `steady_clock` có tick 1 ms; kết quả thực tế có thể khác. Mã sách chọn hiển thị period theo mili giây khi period không lớn hơn 1 ms, ngược lại theo giây. Chú thích sách ghi `steady_clock` ban đầu từng được đề xuất với tên `monotonic_clock`.

:::note Góc nhìn hiện đại
Từ C++20, `system_clock` đo Unix time từ 00:00:00 UTC ngày 1/1/1970, không tính leap second; mô tả epoch không xác định trong sách là bối cảnh C++11. `high_resolution_clock` vẫn không tự đảm bảo monotonic. Khi đo thời gian trôi qua, ưu tiên `steady_clock`.
:::

`system_clock` có thể được điều chỉnh; vì thế kiểm tra `system_clock::now() > start + minutes(1)` có thể cho kết quả sai lệch về thời gian đã trôi qua, và hiệu giữa hai lần đọc có thể âm. Dùng `steady_clock` cho thời gian chờ hoặc đo khoảng thời gian tương đối:

```cpp
auto start = std::chrono::steady_clock::now();
// ... công việc
const auto elapsed = std::chrono::steady_clock::now() - start;
const auto seconds = std::chrono::duration_cast<std::chrono::seconds>(elapsed);
std::cout << seconds.count() << " seconds\n";
```

Đây là ví dụ được điều chỉnh từ sách: sách minh họa `system_clock` để chỉ ra rủi ro điều chỉnh, và có lỗi tên biến ở dòng in.

## `time_point`

Mẫu lớp có dạng `std::chrono::time_point<Clock, Duration>`, với `Duration` mặc định là `Clock::duration`. Bốn giá trị đặc biệt:

1. Constructor mặc định tạo time point tại epoch của clock.
2. `Clock::now()` lấy thời điểm hiện tại.
3. `time_point::min()` và `time_point::max()` cho hai giới hạn biểu diễn.

Một time point chứa duration tương đối với epoch; `time_since_epoch()` lấy duration đó.

| Thao tác | Kết quả |
|:---|:---|
| `time_point t`, `time_point t(d)` | Epoch, hoặc thời điểm lệch `d` so với epoch. |
| `time_point t(tp2)` | Chuyển từ time point cùng clock với duration tương thích. |
| `time_point_cast<D>(tp)` | Chuyển duration biểu diễn sang `D`, giữ nguyên clock. |
| `tp += d`, `tp -= d` | Dịch chuyển time point khi kiểu tương thích. |
| `tp + d`, `d + tp`, `tp - d` | Tạo time point mới. |
| `tp1 - tp2` | Duration giữa hai time point cùng clock phù hợp. |
| `==`, `!=`, `<`, `<=`, `>`, `>=` | So sánh các time point cùng clock phù hợp. |
| `tp.time_since_epoch()` | Duration từ epoch đến `tp`. |
| `time_point::min()`, `time_point::max()` | Các giới hạn của kiểu time point. |

*Bảng 5.24, trang 155.* Cú pháp `time_point_cast<C,D>(tp)` trong bảng sách dễ gây hiểu nhầm: đối số template cần chỉ định thông thường là **duration đích** `D`; clock được suy luận từ `tp`.

### Chuyển sang thời gian lịch

Sách chuyển `system_clock::time_point` sang `time_t` rồi dùng `std::ctime` để hiển thị giờ địa phương. Có thể quan sát epoch và thời điểm hiện tại như sau:

```cpp
#include <chrono>
#include <ctime>
#include <iostream>

int main() {
    using Clock = std::chrono::system_clock;
    const Clock::time_point epoch{};
    const std::time_t t = Clock::to_time_t(epoch);
    if (const char* text = std::ctime(&t)) {
        std::cout << "epoch (local): " << text;
    }
}
```

Kết quả phụ thuộc múi giờ và khả năng biểu diễn của môi trường. Trong ví dụ sách, epoch UTC nửa đêm 1/1/1970 hiện thành 01:00 tại Đức khi đó. Để biểu diễn UTC, sách dùng `std::gmtime` rồi `std::asctime`; giờ mùa hè có thể tạo độ lệch khác ở thời điểm khác. Các hàm C này có thể dùng vùng lưu trữ dùng chung và có thể thất bại; cần kiểm tra và dùng API phù hợp khi xử lý đồng thời. `to_time_t`/`from_time_t` là giao diện của `system_clock`, không thể mặc định áp dụng cho clock khác.

### Số học time point và tràn

Ví dụ dựa theo sách, dùng ngày có độ dài cố định 24 giờ:

```cpp
using namespace std::chrono;
using Days = duration<int, std::ratio<86400>>;
system_clock::time_point tp{};
tp += Days(1) + hours(23) + minutes(55);
auto diff = tp - system_clock::time_point{};
auto minutesPassed = duration_cast<minutes>(diff).count(); // 2875
auto daysPassed = duration_cast<Days>(diff).count();       // 1
```

`duration_cast` về ngày nguyên cắt phần lẻ về phía zero, nên 47 giờ 55 phút thành 1 ngày. Sách tiếp tục trừ một năm 365 ngày rồi hai lần trừ 50 năm cũng tính theo 365 ngày: kết quả lịch lệch vì bỏ qua năm nhuận. Ở một implementation được tác giả thử, phép trừ cuối vượt miền biểu diễn và hiển thị một năm sai. Đây là minh họa rằng phép toán thời gian không tự kiểm tra tràn.

:::warning Tràn và lịch
Không dựa vào kết quả “quay vòng” khi representation số nguyên có dấu bị tràn: hành vi có thể không xác định. Một khoảng 365 × 24 giờ không tương đương mọi năm lịch; lịch, múi giờ và leap second có quy tắc riêng. Nhận xét của sách rằng `chrono` không phải thư viện lịch phản ánh C++11; C++20 đã bổ sung nhiều tiện ích calendar và time zone, tùy mức hỗ trợ implementation.
:::
