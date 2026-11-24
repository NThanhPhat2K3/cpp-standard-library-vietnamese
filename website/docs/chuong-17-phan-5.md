---
id: chuong-17-phan-5
title: 'Chương 17 · Số phức'
---

Phần này theo mục 17.2.1–17.2.3, trang 925–931. Header `<complex>` cung cấp `std::complex<T>`, biểu diễn số `a + bi` với `i² = -1`; `a` là phần thực và `b` là hệ số phần ảo. Các specialization chuẩn được sách trình bày là `float`, `double` và `long double`.

## Tạo và truy cập

`std::complex<double> z(4.0, 3.0)` tạo `4 + 3i`; bỏ đối số thứ hai thì phần ảo bằng 0, bỏ cả hai thì cả hai phần bằng 0. `z.real()` và `z.imag()` đọc hai phần; từ C++11, `z.real(value)` và `z.imag(value)` thay trực tiếp từng phần.

| Hàm | Ý nghĩa với `z = a + bi` |
| --- | --- |
| `std::abs(z)` | Độ lớn `sqrt(a²+b²)`. |
| `std::norm(z)` | Bình phương độ lớn `a²+b²`. |
| `std::arg(z)` | Góc pha theo radian. |
| `std::conj(z)` | Liên hợp `a-bi`. |
| `std::polar(r, theta)` | Tạo số phức từ độ lớn `r` và góc `theta` theo radian. |
| `std::proj(z)` | Phép chiếu lên mặt cầu Riemann, từ C++11. |

```cpp
#include <cassert>
#include <cmath>
#include <complex>

int main() {
    std::complex<double> z(4.0, 3.0);
    assert(std::abs(z) == 5.0 && std::norm(z) == 25.0);
    assert(std::conj(z) == std::complex<double>(4.0, -3.0));
    std::complex<double> fromPolar = std::polar(5.0, std::arg(z));
    assert(std::abs(fromPolar - z) < 1e-12);
    z.imag(0.0);
    assert(z.real() == 4.0 && z.imag() == 0.0);
}
```

`polar` yêu cầu các đối số hợp lệ cho phép tính: dùng độ lớn không âm và góc hữu hạn. Kết quả lượng giác/số thực có sai số làm tròn; so sánh gần đúng khi thích hợp.

## Phép toán và chuyển kiểu

Các toán tử `+`, `-`, `*`, `/` và phép gán kết hợp tương ứng làm việc với số phức và scalar phù hợp. Chuyển giữa `complex<float>`, `complex<double>`, `complex<long double>` có quy tắc constructor khác nhau: chuyển sang kiểu hẹp hơn có thể cần khởi tạo tường minh. Khi hai toán hạng phức khác kiểu, hãy chuyển rõ về một kiểu chung trước khi áp dụng toán tử.

```cpp
#include <cassert>
#include <cmath>
#include <complex>

int main() {
    std::complex<double> a(4.0, 3.0);
    std::complex<float> b(1.0f, 2.0f);
    std::complex<double> sum = a + std::complex<double>(b);
    assert(sum == std::complex<double>(5.0, 5.0));
    assert(std::abs((4.4 + a * 1.8) - std::complex<double>(11.6, 5.4)) < 1e-12);
}
```

So sánh chính xác số thực có thể phụ thuộc làm tròn; ví dụ giá trị thập phân trên nên dùng sai số cho kiểm tra portable. Constructor và assignment có thể áp dụng các quy tắc chuyển kiểu khác nhau; không mặc định rằng phép gán hẹp sẽ được compiler từ chối. Sách dùng `complex<int>` làm ví dụ lịch sử, nhưng các specialization được bảo đảm ở đây là các kiểu số thực chuẩn, nên ưu tiên những kiểu đó.

## Nhập xuất

Output stream ghi số phức dưới dạng `(real,imag)`. Input chấp nhận một giá trị thực, `(real)` hoặc `(real,imag)` theo quy tắc stream và locale. `std::pow` hỗ trợ lũy thừa số phức; kết quả có thể có phần rất nhỏ do làm tròn, ví dụ một kết quả lý thuyết thuần thực có phần ảo gần 0.

Ví dụ thứ hai trong sách đọc hai số phức rồi tính số thứ nhất lũy thừa số thứ hai. Chương trình dưới dùng `istringstream` để minh họa ba dạng đầu vào và kiểm tra kết quả mà không phụ thuộc vào đầu ra tương tác:

```cpp
#include <cassert>
#include <cmath>
#include <complex>
#include <sstream>

int main() {
    std::istringstream input("2 (16) (0,2)");
    std::complex<double> a, b, c;
    input >> a >> b >> c;
    assert(input);
    assert(a == std::complex<double>(2.0, 0.0));
    assert(b == std::complex<double>(16.0, 0.0));
    assert(c == std::complex<double>(0.0, 2.0));

    const auto root = std::pow(b, std::complex<double>(0.5, 0.0));
    const auto squared = std::pow(c, std::complex<double>(2.0, 0.0));
    assert(std::abs(root - std::complex<double>(4.0, 0.0)) < 1e-12);
    assert(std::abs(squared - std::complex<double>(-4.0, 0.0)) < 1e-12);
}
```

Các cặp ví dụ này tương ứng với `16^0.5` và `(2i)^2` trong bảng 17.4. Kết quả in thực tế có thể xuất hiện một phần ảo rất gần 0 thay vì đúng 0; điều đó không làm thay đổi kết quả toán học lý tưởng. Khi đọc dữ liệu thật, kiểm tra trạng thái stream trước khi dùng giá trị.
