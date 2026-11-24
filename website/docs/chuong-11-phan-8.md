---
id: chuong-11-phan-8
title: 'Chương 11 · Kiểm tra thứ tự và điều kiện'
sidebar_label: '11 · Phần 8: Sorted, partition và heap'
---

# 11.5.4–11.5.5 · Kiểm tra thứ tự và điều kiện

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 549–556 (PDF trang 578–585). Các điều kiện biên được làm rõ thêm.

Sách minh họa so sánh từ điển bằng cách sắp một `vector<list<int>>`. Với các list bắt đầu bằng `1 2 3 4 5`, thứ tự là list ngắn nhất, tiếp đến list có phần tiếp `2`, rồi `2 0`, cuối cùng `7`. Comparator có thể gọi `std::lexicographical_compare` cho hai list; không cần random-access iterator bên trong list vì `std::sort` sắp **vector** chứa chúng.

## `is_sorted` và `is_sorted_until`

`std::is_sorted(first,last[,comp])` kiểm tra phạm vi đã sắp theo comparator. `is_sorted_until` trả iterator tới phần tử đầu tiên phá vỡ thứ tự, hoặc `last` nếu toàn bộ phạm vi đã sắp. Phạm vi rỗng hoặc một phần tử được coi là đã sắp. Comparator phải đáp ứng yêu cầu thứ tự phù hợp và không sửa phần tử.

```cpp
#include <algorithm>
#include <cassert>
#include <map>
#include <string>

int main() {
    std::map<int, std::string> values{{1,"Bill"}, {2,"Jim"}, {3,"Nico"},
                                      {4,"Liu"}, {5,"Ai"}};
    using Entry = std::map<int, std::string>::value_type;
    auto byName = [](const Entry& a, const Entry& b) { return a.second < b.second; };
    assert(!std::is_sorted(values.cbegin(), values.cend(), byName));
    auto pos = std::is_sorted_until(values.cbegin(), values.cend(), byName);
    assert(pos != values.cend() && pos->second == "Liu");
}
```

Map được duyệt theo khóa số; điều đó không đồng nghĩa các tên được sắp. `Liu` là phần tử đầu phá vỡ thứ tự tên sau `Nico`.

## `is_partitioned` và `partition_point`

Một phạm vi được phân vùng theo predicate khi mọi phần tử cho kết quả `true` đứng trước mọi phần tử `false`. `is_partitioned` kiểm tra điều này; `partition_point` trả iterator đầu của nhóm `false`, hoặc `last` nếu không có. Trước khi gọi `partition_point`, phạm vi phải đã phân vùng theo **cùng predicate**.

```cpp
#include <algorithm>
#include <cassert>
#include <vector>

int main() {
    std::vector<int> values{5,3,9,1,3,4,8,2,6};
    auto odd = [](int x) { return x % 2 != 0; };
    assert(std::is_partitioned(values.cbegin(), values.cend(), odd));
    auto boundary = std::partition_point(values.cbegin(), values.cend(), odd);
    assert(boundary != values.cend() && *boundary == 4);
}
```

Nếu mọi phần tử thỏa predicate, boundary là `end()` và không được dereference; nếu không phần tử nào thỏa, boundary là `begin()`. `partition_point` dùng số phép gọi predicate logarithmic, nhưng di chuyển iterator có thể tuyến tính nếu không random access. Sách có dòng nhầm mô tả predicate là binary; hai hàm này nhận **unary predicate**.

## `is_heap` và `is_heap_until`

Hai hàm yêu cầu random-access iterator. `is_heap` kiểm tra tính chất heap theo comparator; `is_heap_until` trả phần tử đầu làm tiền tố không còn là heap, hoặc `last`. Với comparator mặc định, mỗi nút cha không nhỏ hơn các nút con, nên phần tử đầu là một maximum khi phạm vi không rỗng.

```cpp
#include <algorithm>
#include <cassert>
#include <vector>

int main() {
    std::vector<int> heap{9,8,7,7,7,5,4,2,1};
    std::vector<int> other{5,3,2,1,4,7,9,8,6};
    assert(std::is_heap(heap.begin(), heap.end()));
    auto pos = std::is_heap_until(other.begin(), other.end());
    assert(pos != other.end() && *pos == 4);
}
```

Giá trị 4 vi phạm quan hệ với **nút cha 3**, dù nhỏ hơn phần tử đầu 5. Vì vậy cách diễn giải trong sách rằng phần tử vi phạm phải lớn hơn phần tử đầu là chưa đủ chính xác.

## `all_of`, `any_of`, `none_of`

Các thuật toán này lần lượt kiểm tra mọi, ít nhất một, hoặc không phần tử nào thỏa unary predicate. Chúng có thể dừng sớm; predicate không nên phụ thuộc số lần gọi ngoài hợp đồng. Với phạm vi rỗng: `all_of` và `none_of` trả `true`, `any_of` trả `false`.

```cpp
#include <algorithm>
#include <cassert>
#include <vector>

int main() {
    std::vector<int> values{1,2,3,4,5,6,7,8,9};
    auto even = [](int x) { return x % 2 == 0; };
    assert(!std::all_of(values.begin(), values.end(), even));
    assert(std::any_of(values.begin(), values.end(), even));
    assert(!std::none_of(values.begin(), values.end(), even));
}
```
