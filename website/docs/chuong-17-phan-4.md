---
id: chuong-17-phan-4
title: 'Chương 17 · Phân phối liên tục và lấy mẫu theo đoạn'
---

Phần này theo mục 17.1.5, trang 921–924. Với biến liên tục, `f(x)` là **mật độ xác suất**; xác suất trên một khoảng là diện tích dưới đường mật độ trên khoảng đó, không phải giá trị `f(x)` tại một điểm.

## Các phân phối liên tục

| Distribution | Tham số mặc định trong C++11 | Ý nghĩa |
| --- | --- | --- |
| `uniform_real_distribution` | `a=0`, `b=1` | Mật độ đều trên `[a,b)`. |
| `exponential_distribution` | `lambda=1` | Mô hình thời gian chờ với tốc độ `lambda`. |
| `gamma_distribution` | `alpha=1`, `beta=1` | Phân phối gamma với shape `alpha`, scale `beta`. |
| `weibull_distribution` | `a=1`, `b=1` | Phân phối Weibull với shape `a`, scale `b`. |
| `extreme_value_distribution` | `a=0`, `b=1` | Phân phối giá trị cực trị với vị trí `a`, scale `b`. |
| `normal_distribution` | `mean=0`, `stddev=1` | Phân phối chuẩn; `stddev` là độ lệch chuẩn. |
| `lognormal_distribution` | `m=0`, `s=1` | Logarit của giá trị có phân phối chuẩn với tham số `m`, `s`. |
| `chi_squared_distribution` | `n=1` | Phân phối chi bình phương. |
| `cauchy_distribution` | `a=0`, `b=1` | Phân phối Cauchy với vị trí `a`, scale `b`. |
| `fisher_f_distribution` | `m=1`, `n=1` | Phân phối F với hai bậc tự do. |
| `student_t_distribution` | `n=1` | Phân phối Student t. |

:::note Đính chính giá trị mặc định
Bảng trang 923 của sách ghi `a=1` cho `extreme_value_distribution` và `cauchy_distribution`; constructor mặc định C++11 dùng `a=0` cho cả hai. Các tham số scale, độ lệch chuẩn, tốc độ và bậc tự do tương ứng cần thỏa điều kiện dương theo hợp đồng từng distribution.
:::

## Một số mật độ trong sách

- Uniform: `f(x) = 1/(b-a)` trên khoảng `[a,b)` khi `a < b`.
- Exponential: `f(x) = λ exp(-λx)` với `x >= 0`, `λ > 0`.
- Gamma: `f(x) = x^(α-1) exp(-x/β) / (β^α Γ(α))` với `x > 0`, `α, β > 0`.
- Weibull: `f(x) = (a/b)(x/b)^(a-1) exp(-(x/b)^a)` với `x >= 0`, `a,b > 0`.
- Normal: `f(x) = exp(-(x-μ)^2/(2σ^2)) / (σ sqrt(2π))` với `σ > 0`.
- Lognormal: `f(x) = exp(-(ln(x)-m)^2/(2s^2)) / (x s sqrt(2π))` với `x > 0`, `s > 0`.
- Cauchy: `f(x) = 1 / (πb (1 + ((x-a)/b)^2))` với `b > 0`.

Các công thức còn lại trong bảng của sách, với `Γ` là hàm gamma, là:

- Extreme value: `f(x) = exp((a-x)/b - exp((a-x)/b)) / b`, với `x` thực và `b > 0`.
- Chi bình phương: `f(x) = x^(n/2-1) exp(-x/2) / (2^(n/2) Γ(n/2))`, với `x > 0`, `n > 0`.
- Fisher F: `f(x) = Γ((m+n)/2) / (Γ(m/2)Γ(n/2)) × (m/n)^(m/2) × x^(m/2-1) × (1+mx/n)^(-(m+n)/2)`, với `x > 0`, `m,n > 0`.
- Student t: `f(x) = Γ((n+1)/2) / (sqrt(nπ) Γ(n/2)) × (1+x²/n)^(-(n+1)/2)`, với `x` thực và `n > 0`.

Các công thức mô tả mật độ lý thuyết; không nên tính trực tiếp bằng dạng trên cho mọi giá trị nếu cần độ ổn định số. Chọn mô hình theo ý nghĩa thống kê và kiểm tra điều kiện của distribution trước khi khởi tạo.

:::note Điều kiện biên của uniform real
Cần phân biệt điều kiện để công thức mật độ ở trên có nghĩa với tiền điều kiện của constructor. Theo [bản dự thảo chuẩn](https://eel.is/c++draft/rand.dist.uni.real), constructor yêu cầu `a <= b` và `b-a` không lớn hơn `numeric_limits<RealType>::max()`. Khi `a == b`, công thức mật độ `1/(b-a)` không xác định và khoảng `[a,b)` rỗng; vì vậy không áp dụng lời giải thích về mật độ trên như với khoảng có độ rộng dương. Với bài toán cần lấy mẫu đều trên một khoảng thực không rỗng, chọn `a < b` và kiểm tra cả giới hạn độ rộng.
:::

## Phân phối theo từng đoạn

`piecewise_constant_distribution` nhận các biên tăng dần và trọng số tương ứng với từng khoảng; mật độ không đổi bên trong mỗi khoảng. `piecewise_linear_distribution` nhận biên và trọng số tại các điểm biên; mật độ nội suy tuyến tính giữa hai điểm. Distribution chuẩn hóa các trọng số; cần thỏa các điều kiện về số lượng, thứ tự biên, trọng số và tổng khác 0.

Viết theo ký hiệu của sách, với các biên `b₀ < b₁ < ... < bₙ` và `bᵢ <= x < bᵢ₊₁`:

- Phân phối hằng theo đoạn có `f(x) = ρᵢ`, trong đó `ρᵢ` là mật độ đã chuẩn hóa trên khoảng thứ `i`.
- Phân phối tuyến tính theo đoạn có `f(x) = ρᵢ × (bᵢ₊₁ - x)/(bᵢ₊₁ - bᵢ) + ρᵢ₊₁ × (x - bᵢ)/(bᵢ₊₁ - bᵢ)`. Hai hệ số nội suy thay đổi từ `1, 0` ở đầu trái sang `0, 1` ở đầu phải.

`intervals()` trả các biên và `densities()` trả các mật độ đã chuẩn hóa. Với phân phối hằng có `n` khoảng thì có `n` mật độ; với phân phối tuyến tính có `n + 1` mật độ ở các biên. Mật độ và trọng số đầu vào không nhất thiết có cùng giá trị vì còn bước chuẩn hóa.

```cpp
#include <cassert>
#include <random>
#include <vector>

int main() {
    const std::vector<double> boundaries{0.0, 1.0, 3.0};
    const std::vector<double> weights{1.0, 3.0};
    std::piecewise_constant_distribution<double> d(
        boundaries.begin(), boundaries.end(), weights.begin());
    assert(d.intervals().size() == 3);
    assert(d.densities().size() == 2);
    std::mt19937 engine(42);
    for (int i = 0; i < 100; ++i) {
        double value = d(engine);
        assert(value >= 0.0 && value < 3.0);
    }
}
```

Với `piecewise_constant_distribution`, trọng số xác định xác suất của **khoảng**, còn mật độ bằng xác suất khoảng chia cho độ rộng khoảng; vì vậy các khoảng có độ rộng khác nhau không thể so sánh mật độ chỉ bằng trọng số. Sách nêu thêm các constructor nhận initializer list hoặc hàm tạo trọng số.

Trong ví dụ trên, tổng trọng số là `4`: xác suất của `[0,1)` là `1/4` và của `[1,3)` là `3/4`. Độ rộng hai khoảng lần lượt là `1` và `2`, nên mật độ tương ứng là `1/4` và `3/8`; tích mật độ với độ rộng cho lại xác suất của khoảng.

Với `piecewise_linear_distribution`, các trọng số được đưa tại **biên** thay vì một trọng số cho mỗi khoảng. Mật độ được nội suy tuyến tính và chuẩn hóa sao cho tổng diện tích bằng 1. Ví dụ tạo mật độ dạng tam giác trên `[0,2]`, cao nhất tại `1`:

```cpp
#include <cassert>
#include <cmath>
#include <random>
#include <vector>

int main() {
    const std::vector<double> boundaries{0.0, 1.0, 2.0};
    const std::vector<double> weights{0.0, 1.0, 0.0};
    std::piecewise_linear_distribution<double> d(
        boundaries.begin(), boundaries.end(), weights.begin());
    const auto density = d.densities();
    assert(density.size() == 3);
    assert(std::abs(density[0]) < 1e-12);
    assert(std::abs(density[1] - 1.0) < 1e-12);
    assert(std::abs(density[2]) < 1e-12);
    std::mt19937 engine(42);
    for (int i = 0; i < 100; ++i) {
        const double value = d(engine);
        assert(value >= 0.0 && value < 2.0);
    }
}
```

Trong ví dụ này, diện tích hai tam giác nhỏ cộng lại bằng 1. Trọng số là dữ liệu đầu vào để xây dựng mật độ, không phải xác suất nhận đúng một biên: với phân phối liên tục, xác suất tại một điểm riêng lẻ bằng 0.
