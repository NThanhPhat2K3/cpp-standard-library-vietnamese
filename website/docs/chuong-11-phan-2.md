---
id: chuong-11-phan-2
title: 'Chương 11 · Sắp xếp và phạm vi đã sắp'
sidebar_label: '11 · Phần 2: Sắp xếp và phạm vi đã sắp'
---

# 11.2–11.3 · Sắp xếp và các hàm hỗ trợ ví dụ

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 512–518 (PDF trang 541–547). Các ghi chú sửa những nhận xét phụ thuộc phiên bản hoặc implementation.

## Đổi thứ tự và phân vùng

| Thuật toán | Công dụng |
|:---|:---|
| `reverse`, `reverse_copy` | Đảo thứ tự tại chỗ hoặc ghi bản đảo sang đích. |
| `rotate`, `rotate_copy` | Xoay phạm vi tại điểm giữa hoặc ghi kết quả sang đích. |
| `next_permutation`, `prev_permutation` | Chuyển sang hoán vị kế tiếp/trước đó theo thứ tự từ điển. |
| `shuffle` | Xáo trộn bằng uniform random bit generator được cung cấp. |
| `random_shuffle` | Hàm lịch sử trong sách; bị loại khỏi chuẩn từ C++17. |
| `partition`, `stable_partition`, `partition_copy` | Chia phần tử theo predicate; stable giữ thứ tự tương đối trong mỗi nhóm; biến thể copy ghi vào hai đích. |

Các thuật toán có yêu cầu iterator, comparator, generator và phạm vi đích khác nhau; xem chi tiết từng hàm trước khi dùng.

## Sắp xếp, chọn phần tử và heap

`sort` sắp toàn bộ phạm vi; `stable_sort` giữ thứ tự tương đối của các phần tử tương đương theo comparator. `partial_sort` chỉ sắp một tiền tố; `partial_sort_copy` ghi kết quả vào phạm vi đích. `nth_element` đưa phần tử tại `nth` tới vị trí nó sẽ có trong một thứ tự đã sắp và phân hoạch hai phía; **hai phía không tự được sắp xếp**.

:::note Độ phức tạp của `sort`
Sách nêu `sort` có thể mất thời gian bậc hai trong trường hợp xấu. Với yêu cầu chuẩn C++ hiện đại áp dụng cho `std::sort`, số phép so sánh được giới hạn `O(N log N)` trong trường hợp xấu; chuẩn không bắt buộc quicksort, heapsort hay introsort. `stable_sort` có bảo đảm khác tùy bộ nhớ phụ và phiên bản. Các tỷ lệ nhanh/chậm trong sách chỉ là quan sát lịch sử; hãy benchmark dữ liệu thực tế.
:::

Ví dụ `nth_element(values.begin(), values.begin()+3, values.end())` đặt phần tử có chỉ số 3 vào đúng vị trí nếu sắp toàn bộ. Bốn phần tử đầu là một tập bốn phần tử nhỏ nhất theo thứ tự đó, tính cả phần tử tại `nth`, nhưng thứ tự trong nhóm không được bảo đảm và có thể có giá trị tương đương ở hai phía. Cần bảo đảm dãy có đủ phần tử trước khi tạo iterator `begin()+3`.

`partition` thay vào đó nhận predicate, ví dụ `x < 7`, và trả iterator đầu nhóm không thỏa. Số phần tử mỗi nhóm phụ thuộc dữ liệu. `stable_partition` giữ thứ tự tương đối trong cả hai nhóm.

```cpp
#include <algorithm>
#include <cassert>
#include <vector>

int main() {
    std::vector<int> values{8, 2, 7, 1, 9, 3};
    auto boundary = std::stable_partition(values.begin(), values.end(),
                                           [](int x) { return x < 7; });
    assert((values == std::vector<int>{2, 1, 3, 8, 7, 9}));
    assert(boundary - values.begin() == 3);
}
```

Comparator của thuật toán sắp xếp phải là strict weak ordering; `<=` không hợp lệ. `list` và `forward_list` không có random-access iterator cho `std::sort`, nhưng có `sort()` thành viên. Không phải mọi thuật toán phân vùng cần random-access iterator; yêu cầu cụ thể phụ thuộc thuật toán.

Các hàm heap gồm `make_heap`, `push_heap`, `pop_heap`, `sort_heap`; `is_heap` và `is_heap_until` kiểm tra tính chất heap. `pop_heap` chuyển phần tử ưu tiên tới cuối phạm vi heap, **không tự xóa** phần tử khỏi container. Có thể sắp bằng `make_heap` rồi `sort_heap`; sau `sort_heap`, phạm vi không còn được bảo đảm là heap.

## Phạm vi đã sắp và thuật toán số

| Nhóm | Thuật toán trong sách |
|:---|:---|
| Tìm theo thứ tự | `binary_search`, `lower_bound`, `upper_bound`, `equal_range`. |
| Kiểm tra chứa | `includes`. |
| Trộn và phép tập hợp | `merge`, `set_union`, `set_intersection`, `set_difference`, `set_symmetric_difference`, `inplace_merge`. |
| Phạm vi đã phân vùng | `partition_point`. |
| Tổng và kết hợp | `accumulate`, `inner_product`. |
| Biến đổi dãy số | `adjacent_difference`, `partial_sum`. |

Các hàm xử lý phạm vi đã sắp yêu cầu điều kiện sắp xếp/phân vùng phù hợp comparator và overload, cùng phạm vi đích hợp lệ. Với các phép tập hợp trên dữ liệu có lặp, số lần xuất hiện là một phần ngữ nghĩa, không chỉ việc có hay không có giá trị. `accumulate` có thể nối chuỗi hoặc nhân thay vì cộng bằng operation thích hợp; `partial_sum` và `adjacent_difference` ghi kết quả ra đích.

## 11.3 Hàm phụ trợ trong ví dụ sách

Sách dùng header phụ gồm ba hàm:

- `INSERT_ELEMENTS(c, first, last)` chèn các số nguyên từ `first` **đến cả `last`**; đây không phải phạm vi nửa mở. Nó dùng `insert(c.end(), value)`, nên chỉ phù hợp với container hỗ trợ overload đó.
- `PRINT_ELEMENTS(c, prefix)` in tiền tố tùy chọn và từng phần tử.
- `PRINT_MAPPED_ELEMENTS(c, prefix)` in các cặp `[key,value]`.

Các ví dụ trong bản này thường include trực tiếp header cần thiết và dùng hàm in cục bộ để chạy độc lập. Việc thêm vào container không làm các iterator nguồn không liên quan tự động an toàn; luôn xét invalidation và overlap.
