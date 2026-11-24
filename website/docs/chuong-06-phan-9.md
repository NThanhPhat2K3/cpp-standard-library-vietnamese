---
id: chuong-06-phan-9
title: 'Chương 6 · Nhiều phạm vi và insert iterator'
sidebar_label: '06 · Phần 9: Nhiều phạm vi và inserter'
---

import useBaseUrl from '@docusaurus/useBaseUrl';

# 6.4.2–6.5.1 · Nhiều phạm vi và insert iterator

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 207–212 (PDF trang 236–241). Các hộp ghi chú là phần bổ sung.

## 6.4.2 Thuật toán xử lý nhiều phạm vi

Một số overload thuật toán C++11 nhận đầy đủ `[first1,last1)` cho phạm vi đầu, nhưng chỉ nhận `first2` cho phạm vi thứ hai. Số phần tử xử lý ở phạm vi thứ hai được suy ra từ phạm vi đầu. Ví dụ:

```cpp
std::equal(coll1.begin(), coll1.end(), coll2.begin());
```

<figure className="book-figure">
  <img src={useBaseUrl('/img/two-ranges-figure-6-9.png')} alt="Thuật toán dùng độ dài phạm vi thứ nhất để duyệt phạm vi thứ hai" />
  <figcaption>Hình 6.9 trong sách: thuật toán duyệt hai phạm vi · trang 208 (PDF trang 237).</figcaption>
</figure>

Ở overload ba iterator này, `coll2` phải có đủ phần tử để so sánh với toàn bộ `coll1`. Tương tự, thuật toán ghi cần một vùng đích đủ lớn. Không có `last2` để thuật toán biết nó đã vượt cuối vùng đích.

### Lỗi sao chép vào container rỗng

```cpp
std::list<int> src{1, 2, 3, 4, 5, 6, 7, 8, 9};
std::vector<int> dst;
// std::copy(src.cbegin(), src.cend(), dst.begin()); // SAI: dst rỗng
```

`std::copy` ghi qua output iterator; `dst.begin()` ở đây là `dst.end()` và không thể ghi như một phần tử. Hành vi là không xác định. Một chế độ kiểm tra của thư viện có thể phát hiện lỗi, nhưng không phải mọi implementation đều báo lỗi.

Hai cách được sách đề xuất là tạo đủ phần tử trước hoặc dùng insert iterator:

```cpp
std::vector<int> dst;
dst.resize(src.size());
std::copy(src.cbegin(), src.cend(), dst.begin());

std::deque<int> dst2(src.size());
std::copy(src.cbegin(), src.cend(), dst2.begin());
```

Constructor theo kích thước và `resize` **tạo phần tử**, không chỉ cấp phát bộ nhớ. `vector::reserve(n)` chỉ thay capacity, không thay `size()`, nên không làm cho `copy(..., dst.begin())` hợp lệ khi vector vẫn rỗng.

:::note Góc nhìn hiện đại
Từ C++14, `std::equal` có overload nhận cả hai cặp iterator; C++20 ranges cũng có các overload nhận range. Chọn overload phù hợp để không phải giả định phạm vi thứ hai đủ dài. Điều đó không loại bỏ mọi tiền điều kiện của thuật toán.
:::

## 6.5 Iterator adapter

Iterator là một giao diện trừu tượng; adapter có thể đáp ứng giao diện đó nhưng chuyển thao tác thành hành vi khác. Sách giới thiệu insert iterator, stream iterator, reverse iterator và move iterator; phần chi tiết nằm ở Chương 9.

## 6.5.1 Insert iterator

Insert iterator biến thao tác ghi của thuật toán thành thao tác **chèn** vào container, thay vì ghi đè phần tử đã tồn tại. Đây là output iterator: phép gán kích hoạt việc chèn, còn thao tác tăng của adapter không di chuyển như iterator duyệt thông thường.

```cpp
#include <algorithm>
#include <deque>
#include <iterator>
#include <list>
#include <set>
#include <vector>

std::list<int> src{1, 2, 3, 4, 5, 6, 7, 8, 9};
std::vector<int> back;
std::deque<int> front;
std::set<int> sorted;

std::copy(src.cbegin(), src.cend(), std::back_inserter(back));
std::copy(src.cbegin(), src.cend(), std::front_inserter(front));
std::copy(src.cbegin(), src.cend(), std::inserter(sorted, sorted.begin()));
```

| Hàm tạo adapter | Cách chèn | Kết quả của ví dụ |
|:---|:---|:---|
| `back_inserter(container)` | Gọi `push_back(value)`. | `back`: 1 đến 9. |
| `front_inserter(container)` | Gọi `push_front(value)`. | `front`: 9 đến 1. |
| `inserter(container, pos)` | Gọi `insert(pos, value)` và cập nhật vị trí adapter. | `sorted`: 1 đến 9 theo comparator. |

*Bảng 6.1, trang 212.* `back_inserter` cần `push_back`, `front_inserter` cần `push_front`. Inserter tổng quát cần overload `insert` phù hợp; `array` không thay đổi kích thước và `forward_list` dùng giao diện `insert_after`, nên không dùng trực tiếp dạng đó.

Với associative/unordered container, vị trí truyền vào `inserter` là **hint**, không ép phần tử vào một vị trí trái với quy tắc container. Khi chèn vào sequence container trước một vị trí, adapter duy trì thứ tự các giá trị được đưa vào; `front_inserter` đảo thứ tự vì mỗi giá trị mới vào đầu.

:::warning Nguồn và đích cùng container
Không mặc định có thể `copy` một phạm vi vector sang `back_inserter` của chính vector đó: `push_back` có thể làm iterator nguồn hoặc `end` mất hiệu lực. Chọn cách xử lý có phạm vi và invalidation hợp lệ.
:::
