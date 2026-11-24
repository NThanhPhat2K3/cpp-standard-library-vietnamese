---
id: chuong-05-phan-10
title: 'Chương 5 · numeric_limits chi tiết'
sidebar_label: '05 · Phần 10: numeric_limits'
---

# 5.3 · `numeric_limits` chi tiết

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 115–121 (PDF trang 144–150). Các hộp ghi chú là phần bổ sung. Phần giới thiệu và lưu ý về bảng kích thước nằm ở trang trước.

## Template và specialization

Template không chỉ giúp viết một thuật toán cho nhiều kiểu; nó còn có thể cung cấp một giao diện chung mà mỗi kiểu có một specialization riêng. `std::numeric_limits<T>` trong `<limits>` là một ví dụ.

Template tổng quát có `is_specialized == false`, cho biết không có thông tin giới hạn số chuyên biệt cho `T`; các giá trị mặc định khác không nên được hiểu là giới hạn số hữu ích. Các specialization chuẩn cho kiểu số đặt `is_specialized == true` và cung cấp các giá trị phù hợp với implementation.

```cpp
#include <limits>
#include <string>

static_assert(std::numeric_limits<int>::is_specialized, "int có giới hạn số");
static_assert(!std::numeric_limits<std::string>::is_specialized,
              "string không có specialization chuẩn");
```

Trong C++11, sách liệt kê các specialization cho `bool`, `char`, `signed char`, `unsigned char`, `char16_t`, `char32_t`, `wchar_t`, `short`, `unsigned short`, `int`, `unsigned int`, `long`, `unsigned long`, `long long`, `unsigned long long`, `float`, `double` và `long double`. Các specialization cho `char16_t`, `char32_t`, `long long` và `unsigned long long` có từ C++11. Có thể cung cấp specialization phù hợp cho kiểu số do người dùng định nghĩa theo các quy tắc của chuẩn.

Ví dụ sách đưa ra một implementation có `int` với `min() == -2147483648`, `max() == 2147483647` và `digits == 31`; đây là **giá trị ví dụ**, không phải giới hạn cố định cho mọi nền tảng.

## Các thành viên

Bảng 5.9–5.10 của sách mô tả các thành viên sau. Không phải mọi thành viên đều có ý nghĩa cho mọi loại kiểu; kiểm tra các cờ tương ứng và hợp đồng của kiểu đang xét.

| Thành viên | Ý nghĩa | Macro C liên quan trong sách |
|:---|:---|:---|
| `is_specialized` | Có specialization cung cấp thông tin số cho kiểu. | — |
| `is_signed` | Kiểu có thể biểu diễn giá trị âm. | — |
| `is_integer` | Kiểu là kiểu số nguyên. | — |
| `is_exact` | Biểu diễn chính xác, không có lỗi làm tròn theo đặc tính kiểu. | — |
| `is_bounded` | Tập giá trị biểu diễn được hữu hạn. | — |
| `is_modulo` | Số học của kiểu có tính modulo theo hợp đồng tương ứng. | — |
| `is_iec559` | Kiểu tuân theo các yêu cầu IEC 559/IEEE 754 tương ứng. | — |
| `min()` | Giá trị hữu hạn nhỏ nhất với số nguyên; với số thực có subnormal, là giá trị dương chuẩn hóa nhỏ nhất. | `INT_MIN`, `FLT_MIN`, `CHAR_MIN`, … |
| `max()` | Giá trị hữu hạn lớn nhất. | `INT_MAX`, `FLT_MAX`, … |
| `lowest()` | Giá trị hữu hạn nhỏ nhất theo thứ tự số; từ C++11. | — |
| `digits` | Số chữ số cơ số `radix` biểu diễn được không kể bit dấu; với số thực là độ chính xác phần trị. | `CHAR_BIT`, `FLT_MANT_DIG`, … |
| `digits10` | Số chữ số thập phân có thể biểu diễn mà không mất độ chính xác theo định nghĩa của kiểu. | `FLT_DIG`, … |
| `max_digits10` | Số chữ số thập phân đủ để phân biệt và khôi phục các giá trị dấu phẩy động khác nhau; từ C++11. | — |
| `radix` | Cơ số của biểu diễn số nguyên hoặc số mũ dấu phẩy động. | `FLT_RADIX` |
| `min_exponent`, `max_exponent` | Giới hạn số mũ theo cơ số `radix`. | `FLT_MIN_EXP`, `FLT_MAX_EXP`, … |
| `min_exponent10`, `max_exponent10` | Giới hạn số mũ theo cơ số 10. | `FLT_MIN_10_EXP`, `FLT_MAX_10_EXP`, … |
| `epsilon()` | Khoảng cách từ `1` đến giá trị biểu diễn được kế tiếp lớn hơn `1`. | `FLT_EPSILON`, … |
| `round_style` | Kiểu làm tròn mặc định được biểu diễn bởi `float_round_style`. | — |
| `round_error()` | Thước đo sai số làm tròn tối đa theo định nghĩa chuẩn. | — |
| `has_infinity`, `infinity()` | Cho biết có và cung cấp giá trị dương vô cực. | — |
| `has_quiet_NaN`, `quiet_NaN()` | Cho biết có và cung cấp quiet NaN. | — |
| `has_signaling_NaN`, `signaling_NaN()` | Cho biết có và cung cấp signaling NaN. | — |
| `has_denorm` | Tình trạng hỗ trợ giá trị subnormal/denormal. | — |
| `has_denorm_loss` | Cách phát hiện mất độ chính xác liên quan đến denormalization. | — |
| `denorm_min()` | Giá trị dương subnormal nhỏ nhất nếu có; xem hợp đồng của kiểu. | — |
| `traps` | Cho biết trapping được triển khai cho kiểu. | — |
| `tinyness_before` | Cho biết tính nhỏ được phát hiện trước khi làm tròn. | — |

*Bảng 5.9 và 5.10, trang 117–118.* Macro C được nêu để đối chiếu; ví dụ `CHAR_BIT` là số bit trong một byte, không luôn bằng `numeric_limits<char>::digits` khi `char` có dấu.

:::warning `min()` không luôn là số âm lớn nhất về độ lớn
Với `float`, `min()` thường là số dương chuẩn hóa nhỏ nhất; dùng `lowest()` khi cần giá trị hữu hạn âm nhỏ nhất. Với `int`, `min()` thường trùng `lowest()`. Không suy ra signed overflow sẽ wrap từ `is_modulo`: signed overflow thông thường là hành vi không xác định.
:::

## Một specialization `float` minh họa

Sách đưa ra một specialization giả định phụ thuộc nền tảng, với các giá trị như sau. Đây là dữ liệu minh họa, không phải cấu hình bạn nên tự chép vào `namespace std`:

| Thành viên | Giá trị ví dụ trong sách |
|:---|:---|
| `min()`, `max()`, `lowest()` | `1.17549435E-38F`, `3.40282347E+38F`, `-3.40282347E+38F` |
| `digits`, `digits10`, `max_digits10` | `24`, `6`, `9` |
| `is_signed`, `is_integer`, `is_exact` | `true`, `false`, `false` |
| `is_bounded`, `is_modulo`, `is_iec559` | `true`, `false`, `true` |
| `radix`, `epsilon()` | `2`, `1.19209290E-07F` |
| `round_style`, `round_error()` | `round_to_nearest`, `0.5F` |
| `min_exponent`, `max_exponent` | `-125`, `128` |
| `min_exponent10`, `max_exponent10` | `-37`, `38` |
| `has_infinity`, `has_quiet_NaN`, `has_signaling_NaN` | `true`, `true`, `true` |
| `has_denorm`, `has_denorm_loss` | `denorm_absent`, `false` |
| `denorm_min()` | `min()` trong ví dụ này |
| `traps`, `tinyness_before` | `true`, `true` |

Các hàm `infinity()`, `quiet_NaN()` và `signaling_NaN()` trả giá trị tương ứng khi được hỗ trợ. Bảng giữ các con số sách in ra như một ví dụ lịch sử; không giả định toàn bộ tổ hợp cờ mô tả chính xác máy đang chạy.

Từ C++11, các thành viên này có thể được dùng trong các ngữ cảnh hằng biểu thức phù hợp:

```cpp
constexpr int error_value = std::numeric_limits<int>::max();
float a[std::numeric_limits<short>::max()];
```

Sách lưu ý trước C++11, các thành viên dữ liệu là hằng static nhưng các hàm chưa phải `constexpr`; `lowest()` và `max_digits10` cũng chưa có, và đặc tả ngoại lệ rỗng được dùng thay `noexcept`.

## Làm tròn và subnormal

| `float_round_style` | Ý nghĩa |
|:---|:---|
| `round_toward_zero` | Làm tròn về phía zero. |
| `round_to_nearest` | Làm tròn tới giá trị biểu diễn được gần nhất. |
| `round_toward_infinity` | Làm tròn về dương vô cực. |
| `round_toward_neg_infinity` | Làm tròn về âm vô cực. |
| `round_indeterminate` | Không xác định được kiểu làm tròn. |

*Bảng 5.11, trang 120.*

| `float_denorm_style` | Ý nghĩa |
|:---|:---|
| `denorm_absent` | Không hỗ trợ giá trị denormal/subnormal. |
| `denorm_present` | Có hỗ trợ giá trị denormal/subnormal. |
| `denorm_indeterminate` | Không xác định được. |

*Bảng 5.12, trang 120.* Sách giải thích tên `has_denorm` được giữ lại dù kiểu thành viên đã đổi từ boolean sang enum. Giá trị `denorm_absent` là `0`, `denorm_present` là `1`, còn `denorm_indeterminate` là `-1`.

:::note Góc nhìn hiện đại
Không nên chuyển `has_denorm` sang `bool` rồi kết luận chắc chắn có subnormal: giá trị `denorm_indeterminate` cũng chuyển thành `true` nhưng nghĩa là **không xác định được**. Các thành viên `has_denorm`, `has_denorm_loss`, `denorm_min` và `float_denorm_style` đã bị khuyến cáo không dùng trong C++23; kiểm tra hỗ trợ của implementation khi cần hành vi cụ thể.
:::

## Ví dụ sử dụng

```cpp
#include <iostream>
#include <limits>
#include <string>

int main() {
    std::cout << std::boolalpha;
    std::cout << "max(short): " << std::numeric_limits<short>::max() << '\n';
    std::cout << "max(int): " << std::numeric_limits<int>::max() << '\n';
    std::cout << "max(long): " << std::numeric_limits<long>::max() << '\n';
    std::cout << "max(float): " << std::numeric_limits<float>::max() << '\n';
    std::cout << "max(double): " << std::numeric_limits<double>::max() << '\n';
    std::cout << "max(long double): " << std::numeric_limits<long double>::max() << '\n';
    std::cout << "is_signed(char): " << std::numeric_limits<char>::is_signed << '\n';
    std::cout << "is_specialized(string): "
              << std::numeric_limits<std::string>::is_specialized << '\n';
}
```

Kết quả phụ thuộc nền tảng. Ví dụ trong sách có `max(short) = 32767`, `max(int) = 2147483647`, `max(long) = 2147483647`, `max(float) ≈ 3.40282e+38`, `max(double)` và `max(long double) ≈ 1.79769e+308`, `is_signed(char) = false`, `is_specialized(string) = false`. Giá trị trên máy bạn có thể khác. Dòng cuối cho thấy có thể hỏi specialization cho bất kỳ kiểu nào, kể cả kiểu không phải số.
