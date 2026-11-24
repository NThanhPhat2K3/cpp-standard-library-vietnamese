---
id: chuong-17-phan-6
title: 'Chương 17 · Phép toán và hàm số phức'
---

Phần này theo mục 17.2.3–17.2.4, trang 932–940 của sách, bổ sung bảng tra cứu cho `std::complex<T>`.

## So sánh và số học

`==` và `!=` so sánh từng thành phần. Khi so với scalar phù hợp, scalar tương ứng số phức có phần ảo bằng 0. Các toán tử thứ tự như `<` không được định nghĩa mặc định: số phức không có thứ tự tự nhiên giống số thực. Nếu cần dùng trong container có thứ tự, cung cấp comparator phù hợp với miền dữ liệu và bảo đảm yêu cầu thứ tự yếu chặt; lưu ý các giá trị NaN khi dùng số thực.

Sách đưa ra một cách sắp xếp theo độ lớn rồi theo góc pha. Đây là lựa chọn cho mục đích tổ chức dữ liệu, không phải thứ tự toán học tự nhiên. Ví dụ sau chỉ nhận các số phức hữu hạn có độ lớn hữu hạn; kiểm tra đầu vào trước khi chèn nếu chương trình có thể tạo NaN, vô cực hoặc độ lớn bị tràn:

```cpp
#include <cassert>
#include <complex>
#include <set>

struct ByMagnitudeThenAngle {
    bool operator()(const std::complex<double>& a,
                    const std::complex<double>& b) const {
        const double ma = std::abs(a), mb = std::abs(b);
        return ma < mb || (ma == mb && std::arg(a) < std::arg(b));
    }
};

int main() {
    std::set<std::complex<double>, ByMagnitudeThenAngle> values;
    values.insert(std::complex<double>(1.0, 0.0));
    values.insert(std::complex<double>(-1.0, 0.0));
    values.insert(std::complex<double>(2.0, 0.0));
    assert(values.size() == 3);
}
```

Container coi hai khóa là tương đương khi comparator không xếp khóa nào trước khóa kia. Vì thế, comparator chỉ xét độ lớn sẽ coi `1+0i` và `-1+0i` là tương đương; `set` sẽ không lưu cả hai. Ngay cả khi thêm góc pha, cần chọn quy tắc tương đương phù hợp dữ liệu và yêu cầu ứng dụng.

Các phép `+`, `-`, `*`, `/`, dấu một ngôi và phép gán kết hợp làm việc với số phức hoặc scalar phù hợp. Với `a+bi` và `c+di`, tích là `(ac-bd)+(ad+bc)i`. Các phép chia và hàm siêu việt có thể gặp giá trị vô hạn, NaN, sai số làm tròn hoặc các trường hợp miền đặc biệt; cần xử lý theo mục đích ứng dụng.

## Hàm toán học

| Nhóm | Hàm trong `<complex>` |
| --- | --- |
| Lũy thừa, căn, log | `pow`, `sqrt`, `exp`, `log`, `log10` |
| Lượng giác | `sin`, `cos`, `tan` |
| Hyperbolic | `sinh`, `cosh`, `tanh` |
| Nghịch đảo | `asin`, `acos`, `atan`, `asinh`, `acosh`, `atanh` từ C++11 |
| Thuộc tính | `real`, `imag`, `abs`, `norm`, `arg`, `conj`, `proj` |

Các hàm số phức như `sqrt`, `log` và `pow` dùng quy ước nhánh của thư viện; không coi mọi đồng nhất đại số số thực đều đúng nguyên vẹn khi mở rộng sang số phức.

```cpp
#include <cassert>
#include <cmath>
#include <complex>

int main() {
    const std::complex<double> z(0.0, 2.0);
    const std::complex<double> square = z * z;
    assert(std::abs(square - std::complex<double>(-4.0, 0.0)) < 1e-12);
    const auto root = std::sqrt(std::complex<double>(-4.0, 0.0));
    assert(std::abs(root - std::complex<double>(0.0, 2.0)) < 1e-12);
    const auto viaPow = std::pow(z, 2);
    assert(std::abs(viaPow - square) < 1e-12);
}
```

## Nhập xuất và định dạng

`operator<<` ghi `(real,imag)` theo cờ, precision và locale của stream. Sách mô tả việc tạo một string tạm để áp dụng width cho cả biểu diễn. `operator>>` nhận `real`, `(real)` hoặc `(real,imag)` và đặt `failbit` nếu định dạng không phù hợp. Khi locale dùng dấu phẩy thập phân, biểu diễn có thể khó đọc do dấu phân cách hai thành phần cũng là dấu phẩy; với định dạng trao đổi cần chọn quy tắc rõ ràng.

Ví dụ trong sách tính lũy thừa của hai số phức được nhập. Với locale mặc định dùng dấu chấm thập phân, các dạng đầu vào `2`, `(2)` và `(2,0)` đều biểu diễn số thực 2. Với `(0,2)` lũy thừa `2`, kết quả toán học là `(-4,0)`, nhưng một implementation có thể in phần ảo rất nhỏ khác 0 do làm tròn; giá trị in cụ thể không phải đầu ra được chuẩn cố định.

```cpp
#include <cassert>
#include <complex>
#include <iomanip>
#include <sstream>

int main() {
    std::istringstream input("(3,4) 2");
    std::complex<double> a, b;
    input >> a >> b;
    assert(input);
    assert(a == std::complex<double>(3, 4));
    assert(b == std::complex<double>(2, 0));
    std::ostringstream output;
    output << std::setw(8) << a;
    assert(output.str() == "   (3,4)");
}
```

`complex<T>::value_type` là `T`; `real()` và `imag()` dạng không đối số trả giá trị, không phải tham chiếu có thể sửa. Từ C++11, overload `real(value)` và `imag(value)` thay từng thành phần; một số câu trong phần tham khảo của sách vẫn mô tả quy tắc trước C++11 và cần đọc theo mốc phiên bản này.
