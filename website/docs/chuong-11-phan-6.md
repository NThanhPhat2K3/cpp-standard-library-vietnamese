---
id: chuong-11-phan-6
title: 'Chương 11 · find_end và tìm phần tử lân cận'
sidebar_label: '11 · Phần 6: find_end và adjacent_find'
---

# 11.5.3 · `find_end`, `find_first_of`, `adjacent_find`

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 537–541 (PDF trang 566–570). Các trường hợp biên được làm rõ.

## `find_end`: lần xuất hiện cuối của dãy con

`std::find_end(first,last,pFirst,pLast)` trả iterator đầu của lần xuất hiện **cuối cùng** của mẫu trong phạm vi nguồn; overload predicate so sánh `pred(sourceElement,patternElement)`. Không tìm thấy thì trả `last`; mẫu rỗng cũng trả `last`. So sánh với `search`: mẫu rỗng cho `first`, còn `find_end` cho `last`.

```cpp
#include <algorithm>
#include <cassert>
#include <deque>
#include <iterator>
#include <list>

int main() {
    std::deque<int> values{1,2,3,4,5,6,7,1,2,3,4,5,6,7};
    std::list<int> pattern{3,4,5,6};
    auto pos = std::find_end(values.begin(), values.end(), pattern.begin(), pattern.end());
    assert(pos != values.end() && std::distance(values.begin(), pos) == 9);
    auto previous = std::find_end(values.begin(), pos, pattern.begin(), pattern.end());
    assert(previous != pos && std::distance(values.begin(), previous) == 2);
}
```

Vị trí theo cách đếm từ 1 là 10 rồi 3, như sách. Cách thu hẹp cuối phạm vi thành `pos` tìm các lần xuất hiện nằm hoàn toàn trước vị trí bắt đầu vừa tìm; nó có thể bỏ qua lần xuất hiện **chồng lấp**. Nếu cần mọi lần xuất hiện chồng lấp, phải thiết kế phạm vi tìm khác và kiểm tra điều kiện biên.

## `find_first_of`: phần tử đầu thuộc tập ứng viên

`find_first_of(first,last,candidatesFirst,candidatesLast)` tìm phần tử đầu trong nguồn bằng **ít nhất một** phần tử trong tập ứng viên. Overload predicate gọi `pred(sourceElement,candidate)`. Tập ứng viên rỗng hoặc không có kết quả cho `last`. Không dereference `last`.

```cpp
#include <algorithm>
#include <cassert>
#include <iterator>
#include <list>
#include <vector>

int main() {
    std::vector<int> values{1,2,3,4,5,6,7,8,9,10,11};
    std::list<int> candidates{3,4,5};
    auto first = std::find_first_of(values.begin(), values.end(), candidates.begin(), candidates.end());
    assert(first != values.end() && std::distance(values.begin(), first) + 1 == 3);
    auto last = std::find_first_of(values.rbegin(), values.rend(), candidates.begin(), candidates.end());
    assert(last != values.rend() && std::distance(values.begin(), last.base()) == 5);
}
```

Tìm ngược cho phần tử cuối phù hợp là 5. `last.base()` nằm **sau** phần tử mà reverse iterator đang đọc, vì vậy khoảng cách từ `begin()` tới base bằng vị trí đếm từ 1 trong ví dụ này. Nếu cần iterator tới chính phần tử, dùng `std::prev(last.base())` sau khi kiểm tra kết quả.

## `adjacent_find`: tìm cặp liền kề

`std::adjacent_find(first,last)` tìm cặp liền kề đầu tiên bằng nhau và trả iterator tới **phần tử thứ nhất**. Overload predicate kiểm tra `pred(current,next)`; trả `last` nếu không có cặp phù hợp, kể cả phạm vi ít hơn hai phần tử.

```cpp
#include <algorithm>
#include <cassert>
#include <iterator>
#include <vector>

int main() {
    std::vector<int> values{1,3,2,4,5,5,0};
    auto equal = std::adjacent_find(values.begin(), values.end());
    assert(equal != values.end() && std::distance(values.begin(), equal) + 1 == 5);
    auto doubled = std::adjacent_find(values.begin(), values.end(),
        [](int a, int b) { return static_cast<long long>(a) * 2 == b; });
    assert(doubled != values.end() && *doubled == 2 && *std::next(doubled) == 4);
}
```

Cặp bằng nhau đầu là `5,5` tại vị trí thứ 5; cặp có phần tử sau gấp đôi phần tử trước là `2,4`. Dùng kiểu rộng khi nhân để tránh tràn `int` với dữ liệu tổng quát. Các thuật toán trong phần này không sửa đối số qua predicate; độ phức tạp tìm mẫu phụ thuộc cả độ dài nguồn và mẫu, còn `adjacent_find` duyệt tuyến tính.
