---
id: chuong-05-phan-15
title: 'Chương 5 · Tổng quan chrono và duration'
sidebar_label: '05 · Phần 15: chrono và duration'
---

import useBaseUrl from '@docusaurus/useBaseUrl';

# 5.7–5.7.2 · `chrono` và khoảng thời gian

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 143–149 (PDF trang 172–178). Các ghi chú bổ sung và đính chính được đánh dấu riêng.

## 5.7 Đồng hồ và bộ định thời

Thiết kế thư viện ngày giờ khó hơn vẻ ngoài: hệ thống có nhiều độ chính xác khác nhau và có thể cải thiện theo thời gian. Trước đây, giao diện thời gian C và POSIX đã phát triển qua các độ phân giải giây, mili giây, micro giây và nano giây, với những giao diện mới cho từng bước. C++11 đưa ra thư viện `chrono` trong `<chrono>` với cách biểu diễn không gắn cứng vào một độ chính xác.

Ngoài ra, sách trình bày các giao diện thời gian lịch của C/POSIX và khả năng chờ một khoảng thời gian bằng thư viện luồng. Cần phân biệt API C++ chuẩn với các API POSIX phụ thuộc nền tảng.

## 5.7.1 Tổng quan `chrono`

Các tên của thư viện nằm trong `std::chrono`. Ba khái niệm cốt lõi:

- **Duration:** một số lượng tick và đơn vị của mỗi tick. Ví dụ: 3 phút, 42 mili giây, 86.400 giây hoặc 1,5 tick, mỗi tick bằng 1/3 giây.
- **Time point:** một thời điểm được biểu diễn bằng duration trước hoặc sau một mốc thời gian (*epoch*).
- **Clock:** xác định hệ quy chiếu và cung cấp `now()` để lấy time point hiện tại. Những clock khác nhau có thể có epoch và đặc tính khác nhau; thông thường chỉ trừ hoặc so sánh trực tiếp time point thuộc cùng clock tương thích.

<figure className="book-figure">
  <img src={useBaseUrl('/img/chrono-epoch-figure-5-4.png')} alt="Sơ đồ epoch của đồng hồ, các time point trước và sau epoch cùng duration tương ứng" />
  <figcaption>Hình 5.4 trong sách: epoch, duration và time point · trang 144 (PDF trang 173).</figcaption>
</figure>

Sách lấy Unix epoch làm ví dụ về mốc 1/1/1970. Một time point không tự mang ý nghĩa lịch hay múi giờ nếu không có quy ước chuyển đổi phù hợp. Ví dụ số giây gắn với “giao thừa 2000” trong sách cần xét múi giờ; không nên dùng nó như định nghĩa phổ quát.

## 5.7.2 Duration

`std::chrono::duration<Rep, Period>` kết hợp kiểu biểu diễn số tick `Rep` với chu kỳ tick `Period` tính bằng giây. `Period` là `std::ratio`, mặc định là một giây:

```cpp
std::chrono::duration<int> twentySeconds(20); // 20 giây
std::chrono::duration<double, std::ratio<60>> halfAMinute(0.5); // 30 giây
std::chrono::duration<long, std::ratio<1, 1000>> oneMillisecond(1);
```

Các alias chuẩn C++11 gồm `nanoseconds`, `microseconds`, `milliseconds`, `seconds`, `minutes` và `hours`. Chúng dùng kiểu số nguyên có dấu do implementation chọn với miền biểu diễn tối thiểu phù hợp; period tương ứng lần lượt là 10⁻⁹, 10⁻⁶, 10⁻³, 1, 60 và 3600 giây.

```cpp
std::chrono::seconds twentySeconds(20);
std::chrono::hours aDay(24);
std::chrono::milliseconds oneMillisecond(1);
```

### Phép toán duration

Duration hỗ trợ cộng, trừ, so sánh, tăng/giảm một tick, nhân/chia với số và các phép chia hoặc modulo phù hợp. Khi cộng/trừ hoặc so sánh các duration khác period, thư viện tìm kiểu chung có đơn vị đủ nhỏ để biểu diễn cả hai khi các điều kiện kiểu được đáp ứng.

```cpp
using namespace std::chrono;
seconds d1(42);
milliseconds d2(10);
auto diff = d1 - d2; // 41.990 milliseconds

duration<int, std::ratio<1, 3>> third(1);
duration<int, std::ratio<1, 5>> fifth(1);
auto sum = third + fifth; // 8 tick, mỗi tick 1/15 giây
bool less = third < fifth; // false
```

Ở ví dụ thứ hai, 1/3 giây là 5 tick và 1/5 giây là 3 tick theo đơn vị chung 1/15 giây.

| Thao tác | Ý nghĩa |
|:---|:---|
| `d1 + d2`, `d1 - d2` | Tổng hoặc hiệu hai duration. |
| `d * value`, `value * d`, `d / value` | Nhân hoặc chia duration với số. |
| `d1 / d2` | Tỷ số giữa hai duration. |
| `d % value`, `d1 % d2` | Phần dư khi phép toán trên representation hợp lệ. |
| `==`, `!=`, `<`, `<=`, `>`, `>=` | So sánh duration. |
| `++d`, `d++`, `--d`, `d--` | Tăng/giảm một tick. |
| `d += d2`, `d -= d2` | Cộng/trừ và gán khi chuyển đổi phù hợp. |
| `d *= value`, `d /= value`, `d %= value`, `d %= d2` | Phép toán kết hợp gán khi hợp lệ. |

*Bảng 5.21, trang 146.* Dòng cuối của nhóm so sánh trong bảng in của sách bị lặp ký hiệu `<=`; ý nghĩa “không ngắn hơn” tương ứng `>=`. Không có phép nhân tổng quát hai duration với nhau trong giao diện này.

### Chuyển đổi và thành viên

| Thao tác/thành viên | Ý nghĩa |
|:---|:---|
| `duration d` | Default-initialize representation; với kiểu số cơ bản, giá trị không tự được khởi tạo. |
| `duration d(d2)`, `duration d(value)` | Tạo từ duration hoặc số tick khi constructor phù hợp. |
| `d = d2` | Gán khi chuyển đổi duration được phép. |
| `d.count()` | Lấy số tick đang lưu. |
| `duration_cast<D>(d)` | Chuyển tường minh sang duration `D`. |
| `D::zero()`, `D::min()`, `D::max()` | Giá trị zero, nhỏ nhất và lớn nhất của kiểu duration. |
| `D::rep`, `D::period` | Kiểu representation và kiểu period. |

*Bảng 5.22, trang 147.* Dùng `{}` nếu muốn value-initialize một duration số cơ bản về zero:

```cpp
std::chrono::milliseconds ms{};
ms += std::chrono::seconds(20) + std::chrono::hours(24);
--ms;
ms *= 2;
std::cout << ms.count() << " ms\n";
std::cout << std::chrono::nanoseconds(ms).count() << " ns\n";
```

Kết quả là `172839998 ms` và `172839998000000 ns`. Trong sách có chú thích trung gian ghi `86,400,000` ms sau khi cộng, nhưng 24 giờ **cộng thêm 20 giây** là `86,420,000` ms; kết quả cuối của sách đã phản ánh phép cộng đúng. Sách cũng ghi `milliseconds ms;` là zero, trong khi default initialization với representation số cơ bản không đảm bảo điều đó; ví dụ ở đây dùng `ms{}`.

Có thể in tick và period bằng operator tùy chỉnh như sách minh họa:

```cpp
template <typename V, typename R>
std::ostream& printDuration(std::ostream& out,
                            const std::chrono::duration<V, R>& d) {
    return out << '[' << d.count() << " of " << R::num << '/' << R::den << ']';
}
```

`milliseconds(42)` được in thành `[42 of 1/1000]`. Sách dùng operator `<<`; một operator do người dùng tự thêm có thể gặp giới hạn tra cứu ADL, nên ví dụ trên dùng hàm có tên.

### Chuyển đổi có thể mất độ chính xác

Với representation nguyên, chuyển từ đơn vị thô hơn sang đơn vị mịn hơn thường được cho phép ngầm nếu thỏa các điều kiện kiểu; chuyển ngược có thể mất tick và cần `duration_cast`:

```cpp
std::chrono::seconds sec(55);
// std::chrono::minutes m1 = sec; // LỖI: có thể mất thông tin
std::chrono::minutes m2 = std::chrono::duration_cast<std::chrono::minutes>(sec);
// m2.count() == 0

std::chrono::duration<double, std::ratio<60>> halfMin(0.5);
// std::chrono::seconds s1 = halfMin; // LỖI: floating -> integral
std::chrono::seconds s2 = std::chrono::duration_cast<std::chrono::seconds>(halfMin);
// s2.count() == 30
```

Với giá trị nguyên, chuyển đổi giảm độ chính xác dùng phép chia nguyên và cắt về phía zero. `duration_cast` không tự bảo đảm tránh tràn; đặc biệt chuyển số dấu phẩy động NaN, vô cực hoặc ngoài miền của kiểu nguyên cần tránh.

Ví dụ tách `7.255.042` mili giây thành giờ, phút, giây và mili giây:

```cpp
using namespace std::chrono;
milliseconds ms(7255042);
hours hh = duration_cast<hours>(ms);
minutes mm = duration_cast<minutes>(ms % hours(1));
seconds ss = duration_cast<seconds>(ms % minutes(1));
milliseconds msec = duration_cast<milliseconds>(ms % seconds(1));
// hh.count() == 2, mm.count() == 0, ss.count() == 55, msec.count() == 42
```

Dùng `std::setfill('0')` và `std::setw` có thể định dạng như sách: `02::00::55::042`. Với số âm, phép `%` và cắt về zero cần được xem xét riêng; không tự giả định đây là định dạng lịch chuẩn.
