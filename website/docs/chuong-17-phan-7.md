---
id: chuong-17-phan-7
title: 'Chương 17 · Hàm số học và valarray'
---

Phần này theo mục 17.3–17.4, trang 941–943 của sách. Các hàm số học toàn cục có nguồn gốc từ C chủ yếu nằm trong `<cmath>` và `<cstdlib>`.

## Các nhóm hàm

| Nhóm | Hàm tiêu biểu |
| --- | --- |
| Lũy thừa và log | `pow`, `exp`, `sqrt`, `log`, `log10` |
| Lượng giác | `sin`, `cos`, `tan`, `asin`, `acos`, `atan`, `atan2` |
| Hyperbolic | `sinh`, `cosh`, `tanh`, `asinh`, `acosh`, `atanh` |
| Làm tròn và phần dư | `ceil`, `floor`, `fabs`, `fmod` |
| Tách và tạo số thực | `frexp`, `ldexp`, `modf` |
| Số nguyên trong `<cstdlib>` | `abs`, `labs`, `llabs`, `div`, `ldiv`, `lldiv` |
| Bộ sinh cũ | `rand`, `srand`; phần `<random>` của chương này cung cấp engine và distribution linh hoạt hơn. |

`atan2(y, x)` dùng cả hai tọa độ để xác định góc theo góc phần tư; không thay thế đơn giản bằng `atan(y/x)` khi `x` bằng 0 hoặc khi cần phân biệt góc phần tư. `frexp` tách số thành phần trị và số mũ cơ số 2, `ldexp` thực hiện phép nhân với lũy thừa 2, còn `modf` tách phần nguyên và phần phân số có dấu.

`ceil(x)` và `floor(x)` trả giá trị dấu phẩy động đã làm tròn tương ứng về phía dương vô cực và âm vô cực; chúng không tự chuyển kết quả sang kiểu nguyên. Với phép chia nguyên, `div` trả cả thương `quot` và số dư `rem`. C++ làm tròn thương nguyên về phía 0, nên dấu của số dư cần được xét khi xử lý giá trị âm:

```cpp
#include <cassert>
#include <cmath>
#include <cstdlib>

int main() {
    assert(std::ceil(-3.2) == -3.0);
    assert(std::floor(-3.2) == -4.0);
    const std::div_t result = std::div(-17, 5);
    assert(result.quot == -3 && result.rem == -2);
    assert(std::fmod(-17.0, 5.0) == -2.0);
}
```

Đừng nhầm `fmod` với mọi định nghĩa toán học của modulo: dấu của kết quả trong ví dụ theo số bị chia. Với phép lấy trị tuyệt đối của số nguyên, cần bảo đảm trị tuyệt đối biểu diễn được trong kiểu kết quả; chẳng hạn giá trị âm nhỏ nhất có thể không có đối ứng dương trong cùng kiểu.

```cpp
#include <cassert>
#include <cmath>
#include <cstdlib>

int main() {
    int exponent = 0;
    double fraction = std::frexp(12.0, &exponent);
    assert(std::ldexp(fraction, exponent) == 12.0);
    double integral = 0.0;
    double remainder = std::modf(-3.25, &integral);
    assert(integral == -3.0 && remainder == -0.25);
    std::div_t result = std::div(17, 5);
    assert(result.quot == 3 && result.rem == 2);
}
```

C++ có overload theo kiểu số; dùng đúng kiểu và hiểu kiểu trả về khi kết hợp integer, floating point và complex. Sách cảnh báo `std::sqrt(7)` có thể mơ hồ trên các thư viện cũ; trong C++11, overload số học hỗ trợ đối số nguyên, nhưng viết `7.0` vẫn giúp thể hiện rõ phép tính số thực. Các trường hợp miền xác định, tràn và sai số phụ thuộc hàm và môi trường số học; không mặc định mọi phép tính đều chính xác tuyệt đối.

Sách nêu ví dụ sự khác biệt giữa giao diện C và C++: ngoài các tên như `labs`, `llabs`, `fabs`, C++ cung cấp các overload `std::abs` cho nhiều kiểu số, nên có thể dùng cùng tên với đối số có kiểu khác nhau:

```cpp
#include <cassert>
#include <cmath>
#include <cstdlib>
#include <type_traits>

int main() {
    static_assert(std::is_same<decltype(std::abs(-7)), int>::value, "int");
    static_assert(std::is_same<decltype(std::abs(-7L)), long>::value, "long");
    static_assert(std::is_same<decltype(std::abs(-7.5)), double>::value, "double");
    assert(std::abs(-7) == 7);
    assert(std::abs(-7L) == 7L);
    assert(std::abs(-7.5) == 7.5);
}
```

Chọn overload không xóa giới hạn biểu diễn: nếu trị tuyệt đối của một số nguyên không thể biểu diễn trong kiểu kết quả, không được dùng ví dụ này để giả định phép tính an toàn.

## `std::valarray`

`<valarray>` cung cấp mảng một chiều cho phép áp dụng các phép toán số học lên từng phần tử. Kích thước và điều kiện tương thích của các toán hạng cần phù hợp với phép toán; nó không tự trở thành thư viện ma trận đa chiều. Các cơ chế slice và subset cho phép biểu diễn một số phép xử lý trên tập chỉ số.

```cpp
#include <cassert>
#include <valarray>

int main() {
    std::valarray<double> x{1.0, 2.0, 3.0};
    std::valarray<double> result = 2.0 * x * x + 3.0 * x + 1.0;
    assert(result.size() == 3);
    assert(result[0] == 6.0 && result[1] == 15.0 && result[2] == 28.0);
}
```

Sách nêu rằng thiết kế `valarray` có các bảo đảm và hạn chế về truy cập giúp implementation tối ưu một số biểu thức, có thể tránh tạo các đối tượng trung gian. Nó cũng cung cấp cơ chế chọn subset để hỗ trợ các phép tính có dạng nhiều chiều. Hiệu năng thực tế phụ thuộc implementation và bài toán; không suy ra mọi biểu thức đều không tạo dữ liệu tạm.

Trong ví dụ ý tưởng ở trang 943, **cả các hệ số lẫn biến** đều có thể là mảng. Khi đó biểu thức `z = a*x*x + b*x + c` tính một phương trình cho mỗi chỉ số tương ứng:

```cpp
#include <cassert>
#include <valarray>

int main() {
    const std::valarray<double> a{1.0, 2.0, 3.0};
    const std::valarray<double> b{0.0, 1.0, 2.0};
    const std::valarray<double> c{1.0, 1.0, 1.0};
    const std::valarray<double> x{1.0, 2.0, 3.0};
    const std::valarray<double> z = a * x * x + b * x + c;
    assert(z.size() == 3);
    assert(z[0] == 2.0 && z[1] == 11.0 && z[2] == 34.0);
}
```

Chẳng hạn `z[1]` được tính từ `a[1]`, `b[1]`, `c[1]` và `x[1]`. Các mảng trong ví dụ có cùng kích thước; không dùng phép toán giữa các `valarray` khác kích thước khi yêu cầu tương ứng không được thỏa. Đây là mảng một chiều, còn cách ánh xạ chỉ số thành hàng và cột phải do chương trình xác định.

Tác giả cũng nhận xét thiết kế `valarray` có những hạn chế và ít được dùng, trong bối cảnh cuốn sách được viết. Phần tham khảo chi tiết được đưa vào chương bổ sung trên website sách, không nằm trong mục in này.
