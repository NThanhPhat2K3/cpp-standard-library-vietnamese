---
id: chuong-11-phan-15
title: 'Chương 11 · Sort và sắp xếp một phần'
sidebar_label: '11 · Phần 15: Sort và sắp xếp một phần'
---

# 11.9.1–11.9.3 · Sắp xếp và chọn phần tử

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 596–603 (PDF trang 625–632). Nhận xét lịch sử về độ phức tạp được cập nhật.

## `sort` và `stable_sort`

Cả hai sắp xếp phạm vi random-access `[first,last)` theo thứ tự mặc định hoặc comparator strict weak ordering. `stable_sort` giữ thứ tự tương đối của các phần tử tương đương theo comparator; `sort` không bảo đảm điều đó. `list` và `forward_list` không có random-access iterator, nhưng có hàm thành viên `sort()`.

```cpp
#include <algorithm>
#include <cassert>
#include <string>
#include <vector>

int main() {
    std::vector<std::string> values{"1xxx", "2x", "3x", "4x", "5xx", "11", "12"};
    std::stable_sort(values.begin(), values.end(),
                     [](const std::string& a, const std::string& b) {
                         return a.size() < b.size();
                     });
    assert((values == std::vector<std::string>{"2x","3x","4x","11","12","5xx","1xxx"}));
}
```

Theo comparator độ dài, các chuỗi cùng độ dài là tương đương và giữ thứ tự ban đầu. `sort` có thể tình cờ giữ thứ tự đó, nhưng không được dựa vào điều ấy. Chuẩn hiện đại yêu cầu `sort` có số phép so sánh `O(N log N)` trong trường hợp xấu; mô tả chỉ bảo đảm trung bình và khuyến nghị dùng `partial_sort` để tránh bậc hai trong sách là thông tin lịch sử không nên áp dụng như kết luận hiện nay.

## `partial_sort`

`partial_sort(first,middle,last[,comp])` đưa `middle-first` phần tử nhỏ nhất theo comparator vào tiền tố `[first,middle)` và sắp tiền tố đó. Các phần tử còn lại không được bảo đảm có thứ tự. `middle` phải là vị trí hợp lệ trong `[first,last]`; chọn `middle == last` sắp toàn bộ.

```cpp
#include <algorithm>
#include <cassert>
#include <deque>
#include <functional>

int main() {
    std::deque<int> values{3,4,5,6,7,2,3,4,5,6,1,2,3,4,5};
    std::partial_sort(values.begin(), values.begin()+5, values.end());
    assert((std::deque<int>(values.begin(), values.begin()+5) == std::deque<int>{1,2,2,3,3}));
    std::partial_sort(values.begin(), values.begin()+5, values.end(), std::greater<int>{});
    assert((std::deque<int>(values.begin(), values.begin()+5) == std::deque<int>{7,6,6,5,5}));
}
```

Không dựa vào thứ tự phần đuôi được in trong sách. Lựa chọn `sort` hay `partial_sort` phụ thuộc số phần tử cần lấy và dữ liệu; không có tỷ lệ thời gian cố định cho mọi implementation.

## `partial_sort_copy`

Hàm đọc nguồn và ghi các phần tử nhỏ nhất theo comparator vào một phạm vi đích random-access, được sắp theo thứ tự. Số phần tử ghi là `min(sourceCount,destCapacity)`; iterator trả về chỉ vị trí sau phần đã ghi. Nó không thay đổi nguồn.

```cpp
#include <algorithm>
#include <cassert>
#include <deque>
#include <vector>

int main() {
    std::deque<int> source{3,4,5,6,7,2,3,4,5,6,1,2,3,4,5};
    std::vector<int> dest(6);
    auto end = std::partial_sort_copy(source.cbegin(), source.cend(), dest.begin(), dest.end());
    assert(end == dest.end());
    assert((dest == std::vector<int>{1,2,2,3,3,3}));
}
```

Nếu đích lớn hơn nguồn, chỉ phần đầu tới iterator trả về được ghi; các phần tử đích còn lại giữ giá trị cũ. Trang 601 sách đảo chiều điều kiện trong câu mô tả “copy toàn bộ”: cần **đích có ít nhất bằng số phần tử nguồn**, như ví dụ đích 30 phần tử của sách.

Ví dụ đích dài hơn nguồn và sắp kết quả giảm dần:

```cpp
#include <algorithm>
#include <cassert>
#include <functional>
#include <vector>

int main() {
    const std::vector<int> source{3, 1, 4};
    std::vector<int> dest(5, -1);
    const auto resultEnd = std::partial_sort_copy(
        source.begin(), source.end(), dest.begin(), dest.end(),
        std::greater<int>());
    assert(resultEnd == dest.begin() + 3);
    assert((dest == std::vector<int>{4, 3, 1, -1, -1}));
    assert((source == std::vector<int>{3, 1, 4}));
}
```

Chỉ phạm vi `[dest.begin(), resultEnd)` chứa kết quả; hai giá trị `-1` phía sau vẫn như trước. Không nên in hoặc xử lý toàn bộ đích như kết quả nếu chưa xác định phần được ghi. Nguồn và đích cần đáp ứng điều kiện của thuật toán, bao gồm không dùng phạm vi đích chồng lấp nguồn.

## `nth_element`

`nth_element(first,nth,last[,comp])` đặt phần tử tại `nth` vào vị trí tương ứng với dãy được sắp; các phần tử phía trước không đứng sau các phần tử phía sau theo comparator. Hai bên không được bảo đảm đã sắp. Với overload tuần tự, độ phức tạp trung bình tuyến tính; comparator phải thỏa strict weak ordering.

```cpp
#include <algorithm>
#include <cassert>
#include <deque>

int main() {
    std::deque<int> values{3,4,5,6,7,2,3,4,5,6,1,2,3,4,5};
    auto nth = values.begin() + 3;
    std::nth_element(values.begin(), nth, values.end());
    assert(*nth == 3);
    assert(std::all_of(values.begin(), nth, [nth](int x) { return x <= *nth; }));
    assert(std::all_of(nth, values.end(), [nth](int x) { return x >= *nth; }));
}
```

Với dữ liệu này, bốn phần tử đầu là bốn phần tử nhỏ nhất tính cả phần tử thứ tư, nhưng thứ tự của chúng không được xác định. Không tạo `begin()+3` nếu không có đủ phần tử. Giá trị trùng có thể nằm ở cả hai phía.
