---
id: chuong-11-phan-17
title: 'Chương 11 · Includes và tìm cận'
sidebar_label: '11 · Phần 17: Includes và tìm cận'
---

# 11.10.1 · `includes`, `lower_bound`, `upper_bound`

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 609–614 (PDF trang 638–643). Các ví dụ dùng phạm vi đã sắp theo cùng tiêu chí.

## `includes`

`std::includes(first1,last1,first2,last2[,comp])` kiểm tra phạm vi thứ nhất có chứa đủ các phần tử tương đương của phạm vi thứ hai hay không. Cả hai phạm vi phải được sắp theo cùng comparator. Số lần lặp quan trọng: nếu phạm vi thứ hai có hai số 3, phạm vi thứ nhất phải có **ít nhất hai** số 3 tương đương.

```cpp
#include <algorithm>
#include <cassert>
#include <list>
#include <vector>

int main() {
    std::list<int> values{1,2,3,4,5,6,7,8,9};
    std::vector<int> wanted{3,4,7};
    assert(std::includes(values.begin(), values.end(), wanted.begin(), wanted.end()));
    std::vector<int> repeated{3,3};
    assert(!std::includes(values.begin(), values.end(), repeated.begin(), repeated.end()));
}
```

Phạm vi cần tìm rỗng luôn được bao hàm. Đây là kiểm tra theo comparator và số lần xuất hiện, không phải tìm từng phần tử độc lập rồi bỏ qua số lượng. Thuật toán duyệt tuyến tính theo tổng kích thước hai phạm vi.

## `lower_bound` và `upper_bound`

Với comparator `comp` và phạm vi phân vùng phù hợp:

- `lower_bound(first,last,value,comp)` trả vị trí đầu `it` sao cho `!comp(*it,value)`.
- `upper_bound(first,last,value,comp)` trả vị trí đầu `it` sao cho `comp(value,*it)`.
- Với thứ tự tăng dần thông thường, đó lần lượt là vị trí đầu không nhỏ hơn và vị trí đầu lớn hơn `value`; cả hai có thể bằng `last`.

Sắp toàn bộ phạm vi theo cùng comparator là cách thông dụng để thỏa tiền điều kiện phân vùng. Với comparator giảm dần, không diễn giải máy móc là “>=” và “>” theo thứ tự số thông thường. Số phép so sánh logarithmic, nhưng forward/bidirectional iterator có thể cần số bước di chuyển tuyến tính.

Ví dụ sau áp dụng cùng một comparator giảm dần cho dữ liệu và hai phép tìm cận:

```cpp
#include <algorithm>
#include <cassert>
#include <functional>
#include <vector>

int main() {
    const std::vector<int> values{9, 7, 7, 5, 3};
    const std::greater<int> descending;
    auto first = std::lower_bound(values.begin(), values.end(), 7, descending);
    auto last = std::upper_bound(values.begin(), values.end(), 7, descending);
    assert(first - values.begin() == 1);
    assert(last - values.begin() == 3);
    assert(last - first == 2);
    auto absent = std::equal_range(values.begin(), values.end(), 6, descending);
    assert(absent.first == absent.second);
    assert(absent.first - values.begin() == 3);
}
```

Với `std::greater<int>`, cận dưới của `7` là phần tử đầu **không lớn hơn** 7; cận trên là phần tử đầu **nhỏ hơn** 7. Số 6 không có trong dãy nên hai cận trùng tại vị trí có thể chèn nó. Không dereference iterator khi kết quả bằng `end()`.

## `equal_range`

`std::equal_range(first,last,value[,comp])` trả cặp iterator mô tả phạm vi nửa mở của các phần tử tương đương với `value`, tương ứng hai cận khi các điều kiện của comparator và phạm vi được thỏa. Nếu không có phần tử tương đương, hai iterator bằng nhau. Kiểm tra iterator trước khi dereference.

```cpp
#include <algorithm>
#include <cassert>
#include <iterator>
#include <list>

int main() {
    std::list<int> values{1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9};
    auto range = std::equal_range(values.cbegin(), values.cend(), 5);
    assert(std::distance(values.cbegin(), range.first) + 1 == 9);
    assert(std::distance(values.cbegin(), range.second) + 1 == 11);
    assert(std::distance(range.first, range.second) == 2);
    values.insert(std::lower_bound(values.begin(), values.end(), 3), 3);
    values.insert(std::upper_bound(values.begin(), values.end(), 7), 7);
    assert(std::count(values.begin(), values.end(), 3) == 3);
    assert(std::count(values.begin(), values.end(), 7) == 3);
}
```

Như sách, số 5 có thể được chèn từ vị trí 9 tới 11 khi đếm từ 1 mà vẫn giữ thứ tự. Phạm vi `[range.first,range.second)` chứa hai số 5; cận trên là vị trí sau nhóm, không phải phần tử cuối trong nhóm.

Với associative container có thứ tự, các hàm thành viên `lower_bound`, `upper_bound`, `equal_range` thường tận dụng cấu trúc bên trong thay vì di chuyển tuyến tính qua bidirectional iterator. Unordered container chỉ có `equal_range` theo hash/equality, không có hai hàm cận theo thứ tự.
