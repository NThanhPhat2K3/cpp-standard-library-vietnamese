---
id: chuong-08-phan-8
title: 'Chương 8 · Capacity, bucket và allocator'
sidebar_label: '08 · Phần 8: Capacity, bucket và allocator'
---

# 8.9–8.10 · Capacity, bucket và allocator

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 427–432 (PDF trang 456–461). Chi tiết phụ thuộc phiên bản được nêu riêng.

## 8.9.1 Đọc chính sách container

| Hàm | Ý nghĩa | Nhóm |
|:---|:---|:---|
| `capacity()` | Số phần tử vector/string có thể chứa theo capacity hiện tại. | Vector, string. |
| `key_comp()` | Trả bản sao comparator khóa. | Set, multiset, map, multimap có thứ tự. |
| `value_comp()` | Comparator cho phần tử; với map, so sánh phần khóa của cặp. | Các associative container có thứ tự. |
| `key_eq()` | Trả predicate tương đương khóa. | Unordered container. |
| `hash_function()` | Trả hash function. | Unordered container. |
| `load_factor()` | Tỉ số số phần tử trên số bucket. | Unordered container. |
| `max_load_factor()` | Ngưỡng tải container đang sử dụng. | Unordered container. |

Sách gợi ý thường thay giá trị max load factor mặc định; đây chỉ là kinh nghiệm, không có ngưỡng tốt nhất cho mọi workload. Cần đo thời gian và bộ nhớ với dữ liệu thực tế.

## 8.9.2 Điều chỉnh capacity và hash

### `reserve(n)` và `shrink_to_fit()`

`vector::reserve(n)` yêu cầu capacity ít nhất `n`, không tạo thêm phần tử và không làm giảm capacity. Nếu `n <= capacity()`, vector không reallocate; nếu capacity tăng, mọi iterator, con trỏ và tham chiếu tới phần tử mất hiệu lực. Sau reserve, các lần chèn không reallocate cho đến khi kích thước vượt capacity hiện tại, nhưng vẫn có thể làm mất hiệu lực iterator tại/sau vị trí chèn.

`unordered_*::reserve(n)` chuẩn bị theo **số phần tử** và tương đương yêu cầu `rehash(ceil(n / max_load_factor()))`; nó có thể tổ chức lại bucket, làm iterator mất hiệu lực nhưng giữ con trỏ và tham chiếu tới phần tử. `rehash(n)` nhận **số bucket tối thiểu**, đồng thời phải tính tới kích thước hiện có và max load factor; implementation có thể chọn nhiều bucket hơn.

`shrink_to_fit()` có ở vector, deque và string, là yêu cầu không ràng buộc để giảm bộ nhớ dư, không bảo đảm capacity bằng size. Nó có thể làm iterator, tham chiếu hoặc con trỏ mất hiệu lực tùy container và việc cấp phát lại.

:::note Thay đổi theo phiên bản
Sách mô tả `string::reserve()` không đối số và yêu cầu thu nhỏ khi đối số nhỏ hơn capacity theo giao diện cũ. Đừng áp dụng mô tả đó cho mọi phiên bản: overload không đối số bị loại bỏ từ C++20; dùng `shrink_to_fit()` nếu muốn yêu cầu thu nhỏ, và kiểm tra hợp đồng của chuẩn mục tiêu. `reserve` có thể ném `length_error` hoặc ngoại lệ cấp phát theo điều kiện của container.
:::

### `rehash(n)` và `max_load_factor(x)`

Rehash có thể thay đổi bucket và thứ tự duyệt, làm iterator mất hiệu lực nhưng không làm mất hiệu lực con trỏ/tham chiếu tới các phần tử còn tồn tại. Trong unordered multi-container, thứ tự tương đối của phần tử có khóa tương đương được bảo toàn khi rehash. Bảo đảm khi có ngoại lệ phụ thuộc nguồn ngoại lệ, đặc biệt hash và predicate.

`max_load_factor(x)` đặt ngưỡng dương theo hợp đồng; giá trị có thể được implementation xử lý như hint. Không giả định setter chắc chắn rehash ngay. Có thể gọi `reserve` hoặc `rehash` sau đó nếu muốn yêu cầu tổ chức lại theo nhu cầu.

Ví dụ sau giữ **con trỏ tới phần tử**, không giữ iterator qua `rehash`:

```cpp
#include <cassert>
#include <string>
#include <unordered_set>

int main() {
    std::unordered_set<std::string> names{"An", "Binh", "Chi"};
    const auto found = names.find("Binh");
    assert(found != names.end());
    const std::string* element = &*found;

    names.rehash(names.bucket_count() + 20);
    assert(*element == "Binh");
    const auto after = names.find("Binh"); // lấy iterator mới
    assert(after != names.end() && &*after == element);
}
```

Rehash có thể làm iterator cũ không còn hợp lệ, nhưng con trỏ và tham chiếu tới phần tử còn tồn tại vẫn dùng được. Nếu xóa chính phần tử đó hoặc hủy container, con trỏ không còn hợp lệ. Không dựa vào số bucket hay thứ tự cụ thể sau rehash.

## 8.9.3 Giao diện bucket

| Hàm | Ý nghĩa |
|:---|:---|
| `bucket_count()` | Số bucket hiện tại. |
| `max_bucket_count()` | Số bucket tối đa theo implementation. |
| `bucket(key)` | Chỉ số bucket nơi khóa tương đương sẽ được tìm. |
| `bucket_size(i)` | Số phần tử trong bucket `i`. |
| `begin(i)`, `end(i)`, `cbegin(i)`, `cend(i)` | Phạm vi local iterator trong bucket `i`. |

Chỉ số bucket phải thuộc `[0,bucket_count())`. `bucket(key)` yêu cầu điều kiện hợp lệ của container; không suy luận bucket chỉ từ giá trị hash vì implementation còn ánh xạ hash vào số bucket. Iterator cuối của bucket không được dereference; nếu bucket rỗng, begin và end của nó bằng nhau.

## 8.10 Hỗ trợ allocator

Các container động được sách liệt kê và `string` có `allocator_type` và `get_allocator()`, trả bản sao allocator hiện dùng. `std::array` không cấp phát bộ nhớ động qua allocator nên không có hai thành viên này. Allocator mô tả cách container quản lý bộ nhớ và các thao tác liên quan; chương 19 sẽ đi sâu.

Các nhóm constructor nhận allocator trong sách gồm:

| Nguồn khởi tạo | Kết hợp allocator |
|:---|:---|
| Container rỗng | `container(alloc)`; ordered có thể nhận comparator cùng allocator; unordered có thể nhận số bucket, hash, predicate và allocator. |
| Initializer list | Sequence/string có overload nhận list và allocator; ordered/unordered có các overload kết hợp chính sách tương ứng. |
| Container khác | Copy hoặc move từ container cùng kiểu với allocator được chỉ định. |
| `n` bản sao | Sequence phù hợp và string có overload `container(n,value,alloc)`. |
| Phạm vi `[first,last)` | Sequence/string nhận allocator; ordered có thể thêm comparator; unordered có thể thêm bucket, hash và predicate. |

Tính khả dụng và thứ tự tham số phải kiểm tra theo container và phiên bản; ví dụ chữ ký initializer-list của unordered container ở trang 431 thiếu dấu phẩy trước allocator. Với move constructor có allocator được chỉ định, không mặc định luôn chuyển từng phần tử hoặc luôn chuyển vùng nhớ: hành vi và chi phí phụ thuộc allocator và container. Nguồn sau move vẫn phải được dùng theo hợp đồng của nó.

```cpp
#include <memory>
#include <vector>

int main() {
    std::allocator<int> alloc;
    std::vector<int, std::allocator<int>> values(3, 7, alloc);
    auto current = values.get_allocator();
    (void)current;
    return values.size() == 3 ? 0 : 1;
}
```
