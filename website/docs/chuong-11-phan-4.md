---
id: chuong-11-phan-4
title: 'Chương 11 · Tìm cực trị và phần tử'
sidebar_label: '11 · Phần 4: Cực trị và tìm phần tử'
---

# 11.5.2–11.5.3 · Cực trị và tìm phần tử

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 525–530 (PDF trang 554–559). Các lưu ý về phạm vi rỗng và tính hợp lệ iterator được bổ sung.

## `min_element`, `max_element`, `minmax_element`

Các hàm trong `<algorithm>` nhận phạm vi forward iterator `[first,last)` và tùy chọn comparator. Chúng trả iterator tới phần tử, không trả bản sao giá trị:

- `min_element` trả **minimum đầu tiên**; `max_element` trả **maximum đầu tiên**.
- `minmax_element` trả cặp iterator tới **minimum đầu tiên và maximum cuối cùng** trong các phần tử tương đương.
- Với phạm vi rỗng, hai hàm đơn trả `last`, còn `minmax_element` trả `{last,last}`. Không dereference các iterator đó.

Comparator phải đáp ứng strict weak ordering và không sửa phần tử được so sánh. Các hàm duyệt tuyến tính; `minmax_element` có thể tìm cả hai cực trị với ít phép so sánh hơn gọi riêng hai hàm.

```cpp
#include <algorithm>
#include <cassert>
#include <deque>
#include <iterator>

int main() {
    std::deque<int> values{2,3,4,5,6,-3,-2,-1,0,1,2,3,4,5,6};
    auto mm = std::minmax_element(values.cbegin(), values.cend());
    assert(mm.first != values.cend() && mm.second != values.cend());
    assert(*mm.first == -3 && *mm.second == 6);
    assert(std::distance(mm.first, mm.second) == 9);
    auto firstMax = std::max_element(values.cbegin(), values.cend());
    assert(std::distance(mm.first, firstMax) == -1); // deque: random access
}
```

Maximum đầu tiên nằm ngay trước minimum; maximum cuối cùng cách minimum chín vị trí. Khoảng cách âm trong ví dụ hợp lệ vì deque có random-access iterator; với list, không gọi `std::distance` theo chiều iterator cuối không reachable bằng phép tăng.

Sách còn tìm cực trị theo trị tuyệt đối bằng comparator `abs(a) < abs(b)`, cho minimum 0 và maximum 6 trên dữ liệu trên. Với dữ liệu tổng quát, `std::abs(INT_MIN)` có thể không biểu diễn được trong `int`; cần dùng phép tính với kiểu/biểu diễn đủ rộng trước khi lấy trị tuyệt đối.

## `find`, `find_if`, `find_if_not`

- `find(first,last,value)` trả iterator đầu tiên bằng `value`.
- `find_if(first,last,pred)` trả iterator đầu tiên làm predicate đúng.
- `find_if_not(first,last,pred)` trả iterator đầu tiên làm predicate sai; có từ C++11.
- Nếu không tìm thấy, cả ba trả `last`. Chúng thực hiện tối đa số phép kiểm tra tuyến tính theo độ dài phạm vi.

Associative container có `find` thành viên tìm theo chính sách khóa của nó; thường hiệu quả hơn duyệt tuyến tính, nhưng không nhất thiết dùng cùng quan hệ tương đương với `std::find`. Với phạm vi đã được sắp/phân vùng theo điều kiện phù hợp, có thể dùng các thuật toán tìm cận, sau khi kiểm tra tiền điều kiện.

### Tìm hai lần xuất hiện

Sách tìm hai số 4 trong dãy 1–9 lặp hai lần, rồi in phạm vi bao gồm cả hai số 4. Ví dụ sau giữ iterator đầu tiên riêng và kiểm tra cả hai kết quả:

```cpp
#include <algorithm>
#include <cassert>
#include <iterator>
#include <list>
#include <vector>

int main() {
    std::list<int> values{1,2,3,4,5,6,7,8,9,1,2,3,4,5,6,7,8,9};
    auto first = std::find(values.begin(), values.end(), 4);
    if (first == values.end()) return 1;
    auto second = std::find(std::next(first), values.end(), 4);
    if (second == values.end()) return 1;
    std::vector<int> found(first, std::next(second));
    assert((found == std::vector<int>{4,5,6,7,8,9,1,2,3,4}));
}
```

Không tăng `end()`; `std::next(second)` hợp lệ vì `second` trỏ tới một phần tử, và nó có thể bằng `end()`. Tránh tạo phạm vi từ hai kết quả tìm độc lập nếu không biết thứ tự của chúng. Trong ví dụ sách, `pos2` chỉ được gán khi tìm thấy `pos1`; cách viết trên khiến điều kiện an toàn rõ ràng hơn.

Với dãy 1–9, `find_if(x > 3)` tìm 4 ở vị trí thứ tư, `find_if(x % 3 == 0)` tìm 3 ở vị trí thứ ba, và `find_if_not(x < 5)` tìm 5. Trước khi dereference hoặc diễn giải vị trí, kiểm tra kết quả khác `end()` đối với dữ liệu tổng quát.
