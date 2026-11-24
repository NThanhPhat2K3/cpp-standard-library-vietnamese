---
id: chuong-11-phan-1
title: 'Chương 11 · Tổng quan thuật toán STL'
sidebar_label: '11 · Phần 1: Tổng quan thuật toán'
---

# 11.1–11.2 · Tổng quan thuật toán STL

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 505–511 (PDF trang 534–540). Danh mục phản ánh nội dung sách C++11; các chuẩn mới bổ sung thuật toán và overload.

## 11.1 Header và phạm vi

`<algorithm>` cung cấp phần lớn thuật toán cùng các tiện ích như `min`, `max`, `minmax`, `iter_swap`. `<numeric>` cung cấp thuật toán số như `accumulate` và `iota`; `<functional>` có các function object và adapter thường dùng cùng thuật toán.

Thuật toán truyền thống thường nhận một hoặc nhiều phạm vi iterator. Phạm vi `[first,last)` bao gồm `first` và loại trừ `last`; các iterator và phạm vi phải hợp lệ. Một số overload cũ chỉ nhận điểm bắt đầu của phạm vi thứ hai hoặc đích: caller phải bảo đảm có đủ phần tử. Các overload mới và ranges có thể nhận đủ hai đầu hoặc sentinel tùy thuật toán.

Thông thường thuật toán **ghi vào các phần tử đích đã tồn tại**, không tự mở rộng container. Có thể dùng insert iterator để biến phép ghi thành chèn:

```cpp
#include <algorithm>
#include <iterator>
#include <vector>

int main() {
    std::vector<int> source{1, 2, 3};
    std::vector<int> dest;
    std::copy(source.begin(), source.end(), std::back_inserter(dest));
    return dest == source ? 0 : 1;
}
```

Không dùng `dest.begin()` làm đích cho ba phép ghi khi dest rỗng. Các quy tắc overlap và mất hiệu lực iterator cũng phụ thuộc thuật toán và container.

Predicate một đối số có thể dùng để tìm hoặc lọc; predicate hai đối số có thể dùng để so sánh. Một số thuật toán nhận operation không phải predicate, như phép nhân cho `accumulate`. Callable phải đáp ứng hợp đồng của thuật toán; không dựa vào số bản sao hoặc thứ tự gọi ngoài những gì overload bảo đảm.

## 11.2.2 Quy ước tên và nhóm thuật toán

Hậu tố `_if` thường cho biết overload nhận điều kiện thay cho giá trị, như `find` và `find_if`. Không phải mọi thuật toán nhận callable đều có `_if`: `min_element` nhận comparator như một đối số bổ sung. Hậu tố `_copy` thường chỉ biến thể ghi kết quả ra một phạm vi đích, như `reverse_copy`.

Sách nhóm thuật toán thành: không thay đổi, thay đổi giá trị, loại bỏ, đổi thứ tự, sắp xếp, xử lý phạm vi đã sắp và thuật toán số. Một thuật toán có thể phù hợp nhiều nhóm.

## Thuật toán không thay đổi phạm vi đầu vào

| Nhóm | Thuật toán trong bảng 11.1 |
|:---|:---|
| Duyệt, đếm, cực trị | `for_each`, `count`, `count_if`, `min_element`, `max_element`, `minmax_element`. |
| Tìm một giá trị/điều kiện | `find`, `find_if`, `find_if_not`. |
| Tìm mẫu | `search_n`, `search`, `find_end`, `find_first_of`, `adjacent_find`. |
| So sánh phạm vi | `equal`, `is_permutation`, `mismatch`, `lexicographical_compare`. |
| Kiểm tra cấu trúc | `is_sorted`, `is_sorted_until`, `is_partitioned`, `partition_point`, `is_heap`, `is_heap_until`. |
| Kiểm tra điều kiện | `all_of`, `any_of`, `none_of`. |

Mô tả “không thay đổi” là cách phân nhóm; callable được truyền cho `for_each` có thể sửa phần tử nếu loại iterator và hợp đồng cho phép. Mỗi thuật toán vẫn có yêu cầu iterator riêng: không thể kết luận mọi hàm trên đều dùng được với mọi loại input iterator.

Tên tìm chuỗi và thuật toán không hoàn toàn giống nhau:

| Mục tiêu | Hàm `string` | Thuật toán |
|:---|:---|:---|
| Lần đầu một phần tử | `find` | `find` |
| Lần cuối một phần tử | `rfind` | `find` với reverse iterator |
| Lần đầu một dãy con | `find` | `search` |
| Lần cuối một dãy con | `rfind` | `find_end` |
| Phần tử đầu thuộc một tập | `find_first_of` | `find_first_of` |
| Phần tử cuối thuộc một tập | `find_last_of` | `find_first_of` với reverse iterator |
| `n` phần tử liên tiếp theo điều kiện | — | `search_n` |

## Thay đổi và loại bỏ

Bảng 11.3 liệt kê `for_each`, `copy`, `copy_if`, `copy_n`, `copy_backward`, `move`, `move_backward`, `transform`, `merge`, `swap_ranges`, `fill`, `fill_n`, `generate`, `generate_n`, `iota`, `replace`, `replace_if`, `replace_copy`, `replace_copy_if`. Chúng có thể gán kết quả vào đích, thay giá trị hoặc hoán đổi tùy hàm; xem tiền điều kiện từng overload.

`for_each` có thể gọi một operation sửa phần tử qua tham chiếu. `transform` gọi operation tạo giá trị kết quả rồi ghi vào đích, có thể là cùng phạm vi khi điều kiện overlap của overload cho phép, hoặc một phạm vi khác. Sách nhận xét transform có thể chậm hơn; không có bảo đảm hiệu năng tổng quát như vậy. `std::merge` yêu cầu hai phạm vi đầu vào đã sắp xếp theo cùng comparator: không dựa vào kết quả khi vi phạm tiền điều kiện.

Bảng 11.4 gồm `remove`, `remove_if`, `remove_copy`, `remove_copy_if`, `unique`, `unique_copy`. `remove`/`remove_if` dồn các giá trị được giữ về đầu và trả cuối logic, **không** thay đổi kích thước container. Với vector, dùng `erase(newEnd, end())` để xóa đuôi; từ C++20 có `std::erase`/`std::erase_if` phù hợp. `unique` chỉ loại trùng liền kề theo điều kiện, không tự sắp xếp.

Khóa trong set và khóa `first` trong map không thể sửa qua iterator; vì vậy nhiều thuật toán cần gán toàn bộ phần tử không phù hợp làm đích trực tiếp. Tuy nhiên có thể sửa `second` của map không hằng thông qua một callable thích hợp. Các nhóm đổi thứ tự, sắp xếp và xử lý phạm vi đã sắp được trình bày tiếp theo trong sách.
