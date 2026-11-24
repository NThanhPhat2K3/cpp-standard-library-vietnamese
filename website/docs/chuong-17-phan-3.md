---
id: chuong-17-phan-3
title: 'Chương 17 · Các phân phối rời rạc'
---

Phần này theo mục 17.1.5, trang 921–924, tập trung vào các distribution trả giá trị rời rạc. Ký hiệu `P(X = i)` là xác suất nhận đúng giá trị `i`.

## Phân phối đều và Bernoulli

| Distribution | Giá trị và tham số mặc định |
| --- | --- |
| `uniform_int_distribution<IntType>` | Số nguyên trong `[a,b]`; `a = 0`, `b = numeric_limits<IntType>::max()`. |
| `bernoulli_distribution` | `bool`; xác suất `true` là `p`, mặc định `0.5`. |
| `binomial_distribution<IntType>` | Số lần thành công trong `t` phép thử Bernoulli độc lập; mặc định `t = 1`, `p = 0.5`. |
| `geometric_distribution<IntType>` | Số lần thất bại trước thành công đầu tiên; mặc định `p = 0.5`. |
| `negative_binomial_distribution<IntType>` | Số lần thất bại trước thành công thứ `k`; mặc định `k = 1`, `p = 0.5`. |
| `poisson_distribution<IntType>` | Số sự kiện với kỳ vọng `mean`; mặc định `mean = 1.0`. |
| `discrete_distribution<IntType>` | Chỉ số được chọn theo trọng số không âm. |

Với phân phối đều, `P(X=i) = 1/(b-a+1)` cho từng số nguyên trong khoảng. Bernoulli có `P(true)=p`, `P(false)=1-p`. Nhị thức có `P(X=i) = C(t,i) p^i (1-p)^(t-i)`. Hình học có `P(X=i) = p(1-p)^i` với `i >= 0`; lưu ý kết quả đếm **thất bại**, không đếm tổng số lần thử.

Nhị thức âm có `P(X=i) = C(k+i-1,i) p^k (1-p)^i`; Poisson có `P(X=i) = exp(-mean) mean^i / i!`. Các công thức này mô tả mô hình xác suất; mỗi distribution có điều kiện tham số riêng, chẳng hạn xác suất phải nằm trong miền cho phép, `mean > 0` với Poisson, và các cận nguyên phải thỏa `a <= b`. Kiểm tra hợp đồng của constructor trước khi đưa dữ liệu người dùng vào.

### Điều kiện cho tham số

Đây là phần tra cứu bổ sung khi áp dụng các công thức trong sách. Các khoảng của `p` không giống nhau:

| Distribution | Điều kiện tham số |
| --- | --- |
| `uniform_int_distribution(a,b)` | `a <= b`. |
| `bernoulli_distribution(p)` | `0 <= p <= 1`. |
| `binomial_distribution(t,p)` | `t >= 0` và `0 <= p <= 1`. |
| `geometric_distribution(p)` | `0 < p < 1`. |
| `negative_binomial_distribution(k,p)` | `k > 0` và `0 < p <= 1`. |
| `poisson_distribution(mean)` | `mean > 0`. |

Các điều kiện này có thể đối chiếu trong dự thảo chuẩn ở mục [uniform](https://eel.is/c++draft/rand.dist.uni.int), [Bernoulli](https://eel.is/c++draft/rand.dist.bern) và [Poisson](https://eel.is/c++draft/rand.dist.pois.poisson). Constructor không phải công cụ kiểm tra dữ liệu đầu vào: chương trình cần bảo đảm điều kiện trước khi tạo distribution. Nếu dữ liệu đến từ bên ngoài, hãy kiểm tra rồi mới gọi constructor.

:::note Trường hợp biên của nhị thức âm
Bảng trên nêu tiền điều kiện của constructor `negative_binomial_distribution`, trong đó có `p == 1`. Tuy nhiên, [dự thảo chuẩn hiện tại](https://eel.is/c++draft/rand.dist.bern.negbin) cũng ghi chú rằng công thức xác suất của distribution không xác định tại giá trị biên này. Không nên diễn giải riêng hàng điều kiện constructor thành bảo đảm rằng công thức trong sách áp dụng bình thường tại `p == 1`; các ví dụ ở đây dùng `0 < p < 1`.
:::

Điểm dễ nhầm là đơn vị mà mỗi distribution đếm. `binomial_distribution(t,p)` đếm **số thành công** trong `t` lần thử; `geometric_distribution(p)` đếm **số thất bại** trước thành công đầu tiên; `negative_binomial_distribution(k,p)` đếm số thất bại trước thành công thứ `k`:

```cpp
#include <cassert>
#include <random>

int main() {
    std::mt19937 engine(42);
    std::binomial_distribution<int> successes(5, 0.5);
    std::geometric_distribution<int> failuresBeforeFirst(0.5);
    std::negative_binomial_distribution<int> failuresBeforeThird(3, 0.5);
    const int successesCount = successes(engine);
    assert(successesCount >= 0 && successesCount <= 5);
    assert(failuresBeforeFirst(engine) >= 0);
    assert(failuresBeforeThird(engine) >= 0);
}
```

Ví dụ kiểm tra miền kết quả thay vì yêu cầu một dãy cụ thể giữa các implementation. Mỗi distribution có điều kiện riêng: chẳng hạn `geometric_distribution` yêu cầu `0 < p < 1`, nên không thể thay `0.5` bằng giá trị biên `1` cho constructor đó.

## Trọng số với `discrete_distribution`

Constructor nhận initializer list hoặc phạm vi trọng số. Phân phối chuẩn hóa các trọng số để chọn chỉ số: trọng số `{1, 2, 1}` tạo xác suất tương ứng `1/4`, `1/2`, `1/4`. Với dãy trọng số không rỗng, mỗi trọng số cần không âm, hữu hạn và không phải NaN; tổng phải dương. Không dùng dãy toàn số 0.

Trường hợp phạm vi hoặc initializer list **rỗng** có quy tắc riêng: phân phối hoạt động như có một trọng số bằng 1 và luôn cho chỉ số `0`; constructor mặc định cũng vậy. Điều này khác với dãy không rỗng `{0, 0}`, vốn không thỏa điều kiện tổng dương. Xem [mô tả discrete distribution](https://eel.is/c++draft/rand.dist.samp.discrete).

```cpp
#include <cassert>
#include <random>
#include <vector>

int main() {
    std::mt19937 engine(42);
    std::discrete_distribution<int> choice{1.0, 2.0, 1.0};
    std::vector<double> probabilities = choice.probabilities();
    assert(probabilities.size() == 3);
    assert(probabilities[0] == 0.25 && probabilities[1] == 0.5);
    for (int i = 0; i < 100; ++i) {
        int value = choice(engine);
        assert(value >= 0 && value < 3);
    }
    std::binomial_distribution<int> successes(10, 0.25);
    assert(successes.t() == 10 && successes.p() == 0.25);
    std::vector<double> noWeights;
    std::discrete_distribution<int> empty(noWeights.begin(), noWeights.end());
    assert(empty(engine) == 0);
}
```

Các distribution còn có `param_type` và accessor riêng như `p()`, `t()`, `k()`, `mean()`. Một mẫu nhỏ không bảo đảm tần suất đúng bằng xác suất lý thuyết. Các distribution thực và lấy mẫu theo đoạn tiếp tục ở phần sau.
