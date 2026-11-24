---
id: chuong-11-phan-19
title: 'Chương 11 · Thuật toán số'
sidebar_label: '11 · Phần 19: Thuật toán số'
---

# 11.11 · Thuật toán số

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 623–630 (PDF trang 652–659). Các ví dụ dùng `<numeric>` và dữ liệu của sách.

## `accumulate`

`std::accumulate(first,last,init[,op])` kết hợp các phần tử từ trái sang phải. Mặc định, mỗi bước tính `acc = acc + element`; overload operation tính `acc = op(acc, element)`. Phạm vi rỗng trả `init`.

```cpp
#include <cassert>
#include <functional>
#include <numeric>
#include <vector>

int main() {
    std::vector<int> values{1,2,3,4,5,6,7,8,9};
    assert(std::accumulate(values.begin(), values.end(), 0) == 45);
    assert(std::accumulate(values.begin(), values.end(), -100) == -55);
    assert(std::accumulate(values.begin(), values.end(), 1, std::multiplies<int>{}) == 362880);
    assert(std::accumulate(values.begin(), values.end(), 0, std::multiplies<int>{}) == 0);
}
```

Kiểu của `init` xác định kiểu accumulator. Ví dụ cộng các `double` với `0` nguyên có thể chuyển kết quả từng bước về `int`; dùng `0.0` nếu muốn accumulator `double`. Kiểu số phải đủ rộng và operation phải đáp ứng hợp đồng; không để phép tính số nguyên có dấu tràn. `accumulate` cũng có thể nối chuỗi hoặc xử lý kiểu khác nếu operation hợp lệ.

Với `n` phần tử, thuật toán thực hiện `n` phép cộng hoặc `n` lời gọi operation, theo thứ tự của phạm vi; đây là độ phức tạp tuyến tính nếu coi chi phí mỗi phép kết hợp là hằng số. Sách lưu ý operation không được sửa các đối số; nói chung cũng không được sửa phạm vi nguồn hoặc làm mất hiệu lực iterator mà thuật toán đang sử dụng.

```cpp
#include <cassert>
#include <numeric>
#include <vector>

int main() {
    const std::vector<double> values{0.6, 0.6, 0.6};
    const int integerSum = std::accumulate(values.begin(), values.end(), 0);
    const double realSum = std::accumulate(values.begin(), values.end(), 0.0);
    assert(integerSum == 0); // mỗi bước gán lại accumulator kiểu int
    assert(realSum > 1.79 && realSum < 1.81);
}
```

Ở đây `0` khiến mỗi kết quả trung gian được chuyển về `int`, còn `0.0` chọn accumulator `double`. Ngay cả với `double`, kết quả số thực có thể chịu sai số làm tròn.

## `inner_product`

`std::inner_product(first1,last1,first2,init)` tính lần lượt `acc + a*b`. Overload hai operation tính `acc = op1(acc, op2(a,b))`. Phạm vi thứ hai phải có ít nhất số phần tử của phạm vi thứ nhất; phạm vi đầu rỗng trả `init`.

```cpp
#include <cassert>
#include <functional>
#include <list>
#include <numeric>

int main() {
    std::list<int> values{1,2,3,4,5,6};
    auto squares = std::inner_product(values.cbegin(), values.cend(), values.cbegin(), 0);
    auto reverse = std::inner_product(values.cbegin(), values.cend(), values.crbegin(), 0);
    auto productOfSums = std::inner_product(values.cbegin(), values.cend(), values.cbegin(), 1,
                                             std::multiplies<int>{}, std::plus<int>{});
    assert(squares == 91 && reverse == 56 && productOfSums == 46080);
}
```

Thứ tự operation là **outer trước, inner sau trong danh sách đối số**: `multiplies` kết hợp accumulator với kết quả `plus` của từng cặp. Kết quả và các phép tính trung gian đều cần nằm trong phạm vi kiểu được dùng.

Đặc biệt, chọn accumulator rộng chưa chắc làm phép nhân từng cặp rộng theo: ở overload mặc định, `a * b` được tính theo kiểu của chính hai phần tử trước khi cộng vào accumulator. Nếu chúng là `int`, phép nhân có thể tràn `int` ngay cả khi `init` là `0LL`. Có thể chuyển một toán hạng sang kiểu rộng trong operation thứ hai:

```cpp
#include <cassert>
#include <functional>
#include <numeric>
#include <vector>

int main() {
    const std::vector<int> a{50000, 60000};
    const std::vector<int> b{50000, 60000};
    const long long result = std::inner_product(
        a.begin(), a.end(), b.begin(), 0LL, std::plus<long long>(),
        [](int x, int y) { return static_cast<long long>(x) * y; });
    assert(result == 6100000000LL);
}
```

Với `n` cặp, `inner_product` thực hiện `n` phép kết hợp cặp và `n` phép kết hợp vào kết quả. Ví dụ trên giả sử `long long` biểu diễn được các giá trị và kết quả được dùng; với đầu vào lớn hơn vẫn cần kiểm tra tràn.

## `partial_sum`

`std::partial_sum(first,last,out[,op])` ghi tổng tích lũy theo từng tiền tố. Phần tử đầu được copy, các phần tử tiếp theo kết hợp accumulator trước đó với phần tử hiện tại. Biến thể operation cho phép tính tích lũy khác; trả iterator sau kết quả. Đích phải đủ chỗ hoặc dùng inserter; có thể ghi tại cùng vị trí nguồn theo hợp đồng.

Với `1 2 3 4 5 6`, tổng từng phần là `1 3 6 10 15 21`; dùng `std::multiplies<int>` cho `1 2 6 24 120 720`.

```cpp
#include <cassert>
#include <functional>
#include <iterator>
#include <numeric>
#include <vector>

int main() {
    const std::vector<int> values{1, 2, 3, 4, 5, 6};
    std::vector<int> sums, products;
    std::partial_sum(values.begin(), values.end(), std::back_inserter(sums));
    std::partial_sum(values.begin(), values.end(), std::back_inserter(products),
                     std::multiplies<int>());
    assert((sums == std::vector<int>{1, 3, 6, 10, 15, 21}));
    assert((products == std::vector<int>{1, 2, 6, 24, 120, 720}));
}
```

`back_inserter` mở rộng vector đích; nếu dùng `begin()` của vector đích, vector đó phải có đủ phần tử để ghi. Với input rỗng, thuật toán không ghi phần tử nào.

## `adjacent_difference`

`std::adjacent_difference(first,last,out[,op])` copy phần tử đầu, rồi ghi `current - previous` hoặc `op(current,previous)` cho từng cặp kế tiếp. Kết quả trả về là iterator sau phần đã ghi; nguồn và đích có thể trùng hoàn toàn theo hợp đồng, nhưng không suy ra mọi kiểu overlap đều hợp lệ.

Với `1 2 3 4 5 6`, phép trừ cho `1 1 1 1 1 1`; dùng phép cộng cho `1 3 5 7 9 11`, phép nhân cho `1 2 6 12 20 30`.

### Chuyển giá trị tuyệt đối và tương đối

```cpp
#include <cassert>
#include <numeric>
#include <vector>

int main() {
    std::vector<int> values{17,-3,22,13,13,-9};
    std::adjacent_difference(values.cbegin(), values.cend(), values.begin());
    assert((values == std::vector<int>{17,-20,25,-9,0,-22}));
    std::partial_sum(values.cbegin(), values.cend(), values.begin());
    assert((values == std::vector<int>{17,-3,22,13,13,-9}));
}
```

Phép trừ liên tiếp tạo các thay đổi tương đối; cộng dồn phục hồi dãy ban đầu khi các phép tính hợp lệ và chính xác trong kiểu sử dụng. Với số thực, làm tròn có thể khiến kết quả phục hồi không hoàn toàn giống bit ban đầu. Hai thuật toán đều tuyến tính và đòi phạm vi đích đủ chỗ.
