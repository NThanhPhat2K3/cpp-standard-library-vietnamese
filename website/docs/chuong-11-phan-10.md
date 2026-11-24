---
id: chuong-11-phan-10
title: 'Chương 11 · Transform và swap_ranges'
sidebar_label: '11 · Phần 10: Transform và swap_ranges'
---

# 11.6.3–11.6.4 · Biến đổi và hoán đổi phần tử

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 563–567 (PDF trang 592–596). Ví dụ được viết lại tự đủ.

## `transform` một phạm vi

`std::transform(first,last,out,op)` gọi unary operation cho từng phần tử nguồn và ghi kết quả vào đích. Hàm trả iterator ngay sau kết quả cuối. Đích phải có đủ phần tử hoặc dùng insert iterator; operation và các phạm vi phải đáp ứng hợp đồng thuật toán.

Nguồn và đích có thể bắt đầu cùng vị trí để biến đổi tại chỗ. Điều này không cho phép tùy ý dùng các phạm vi chồng lấp lệch nhau hoặc một operation làm mất hiệu lực iterator đang dùng.

```cpp
#include <algorithm>
#include <cassert>
#include <functional>
#include <iterator>
#include <list>
#include <vector>

int main() {
    std::vector<int> source{1,2,3,4,5,6,7,8,9};
    std::transform(source.cbegin(), source.cend(), source.begin(), std::negate<int>{});
    std::list<int> result;
    std::transform(source.cbegin(), source.cend(), std::back_inserter(result),
                   [](int x) { return x * 10; });
    assert((source == std::vector<int>{-1,-2,-3,-4,-5,-6,-7,-8,-9}));
    assert((result == std::list<int>{-10,-20,-30,-40,-50,-60,-70,-80,-90}));
}
```

Sách tiếp tục duyệt `result` ngược và đổi dấu khi in, cho `90 80 70 60 50 40 30 20 10`. Đối với dữ liệu tổng quát, phủ định số nguyên nhỏ nhất hoặc nhân vượt phạm vi kiểu có thể gây tràn; dữ liệu ví dụ nằm trong phạm vi an toàn.

## `transform` hai phạm vi

`std::transform(first1,last1,first2,out,op)` gọi `op(a,b)` cho từng cặp rồi ghi kết quả. Overload truyền thống không nhận cuối phạm vi thứ hai: caller phải bảo đảm nó có ít nhất `distance(first1,last1)` phần tử, và đích đủ chỗ hoặc là inserter. Có thể ghi đè một nguồn tại cùng vị trí theo hợp đồng của overload.

```cpp
#include <algorithm>
#include <cassert>
#include <functional>
#include <iterator>
#include <list>
#include <vector>

int main() {
    std::vector<int> values{1,2,3,4,5,6,7,8,9};
    std::transform(values.cbegin(), values.cend(), values.cbegin(), values.begin(),
                   std::multiplies<int>{});
    std::list<int> sums;
    std::transform(values.cbegin(), values.cend(), values.crbegin(),
                   std::back_inserter(sums), std::plus<int>{});
    assert((values == std::vector<int>{1,4,9,16,25,36,49,64,81}));
    assert((sums == std::list<int>{82,68,58,52,50,52,58,68,82}));
}
```

Sách tiếp tục trừ từng phần tử của `sums` khỏi `values`, cho `-81 -64 -49 -36 -25 -16 -9 -4 -1`. Không dùng `back_inserter` vào chính vector nguồn nếu phép chèn làm mất hiệu lực các iterator nguồn hoặc `end()` đã lưu.

## `swap_ranges`

`std::swap_ranges(first1,last1,first2)` hoán đổi từng cặp phần tử và trả iterator ngay sau phần được xử lý ở phạm vi thứ hai. Phạm vi thứ hai phải đủ dài và hai phạm vi không được chồng lấp theo hợp đồng của overload. Thuật toán thực hiện số phép swap tuyến tính theo số phần tử.

```cpp
#include <algorithm>
#include <cassert>
#include <deque>
#include <vector>

int main() {
    std::vector<int> a{1,2,3,4,5,6,7,8,9};
    std::deque<int> b{11,12,13,14,15,16,17,18,19,20,21,22,23};
    auto after = std::swap_ranges(a.begin(), a.end(), b.begin());
    assert(after != b.end() && *after == 20);
    std::swap_ranges(b.begin(), b.begin() + 3, b.rbegin());
    assert((b == std::deque<int>{23,22,21,4,5,6,7,8,9,20,3,2,1}));
}
```

Lần thứ hai, ba phần tử đầu và ba phần tử cuối của deque là hai vùng không chồng lấp; reverse iterator làm từng cặp hoán đổi từ ngoài vào trong. Để hoán đổi hai container cùng kiểu, hàm `swap` của container có thể phù hợp hơn, nhưng phải xét allocator, quy tắc iterator và độ phức tạp của loại container đó.
