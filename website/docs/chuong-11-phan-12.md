---
id: chuong-11-phan-12
title: 'Chương 11 · Remove và unique'
sidebar_label: '11 · Phần 12: Remove và unique'
---

# 11.7 · Thuật toán loại bỏ

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 575–582 (PDF trang 604–611). Các ví dụ predicate không thỏa hợp đồng được đánh dấu riêng.

## `remove` và `remove_if`

`std::remove(first,last,value)` và `remove_if(first,last,pred)` dồn các phần tử được giữ về đầu theo thứ tự ban đầu, rồi trả **cuối logic** mới. Chúng không đổi kích thước container. Các phần tử từ cuối logic tới `last` vẫn tồn tại nhưng giá trị của chúng không được dùng để suy ra kết quả lọc.

```cpp
#include <algorithm>
#include <cassert>
#include <vector>

int main() {
    std::vector<int> values{2,3,4,5,6,4,5,6,7,8,9,1,2,3,4,5,6,7};
    auto newEnd = std::remove(values.begin(), values.end(), 5);
    assert(values.size() == 18); // thuật toán chưa xóa phần tử
    values.erase(newEnd, values.end());
    values.erase(std::remove_if(values.begin(), values.end(),
                                [](int x) { return x < 4; }), values.end());
    assert((values == std::vector<int>{4,6,4,6,7,8,9,4,6,7}));
}
```

Sách in một nội dung cụ thể cho đuôi sau `remove`; đó chỉ là kết quả minh họa, không nên dựa vào các giá trị sau cuối logic. Từ C++20 có `std::erase` và `std::erase_if` cho các container hỗ trợ. `list::remove` và `forward_list::remove` thật sự xóa nút; associative container dùng `erase(key)` hoặc `erase_if` thích hợp.

Do `remove` nhận giá trị so sánh bằng tham chiếu, truyền một tham chiếu tới chính phần tử trong phạm vi đang bị dồn có thể khiến giá trị đem so sánh thay đổi. Nếu cần giá trị cố định, lưu một bản sao trước lời gọi. Predicate không nên dựa vào số bản sao hay thứ tự gọi không được bảo đảm.

Ví dụ lưu giá trị cần xóa trước khi thuật toán ghi đè lên các phần tử trong vector:

```cpp
#include <algorithm>
#include <cassert>
#include <vector>

int main() {
    std::vector<int> values{1, 2, 3, 2};
    const int target = values[1];
    values.erase(std::remove(values.begin(), values.end(), target), values.end());
    assert((values == std::vector<int>{1, 3}));
}
```

Nếu truyền trực tiếp `values[1]` thay cho `target`, tham chiếu so sánh có thể trỏ tới một ô bị `remove` ghi đè trong quá trình dồn. Sao chép trước giúp giá trị cần loại không thay đổi trong suốt lời gọi.

## `remove_copy` và `remove_copy_if`

Các biến thể này copy các phần tử **không bị loại** sang đích, giữ thứ tự của chúng và trả iterator ngay sau phần đã ghi. Nguồn không bị thay đổi; đích cần đủ chỗ hoặc dùng inserter, và các phạm vi phải đáp ứng điều kiện overlap của thuật toán.

```cpp
#include <algorithm>
#include <cassert>
#include <iterator>
#include <set>
#include <vector>

int main() {
    std::vector<int> source{1,2,3,4,5,6,1,2,3,4,5,6,7,8,9};
    std::multiset<int> kept;
    std::remove_copy_if(source.begin(), source.end(), std::inserter(kept, kept.end()),
                        [](int x) { return x < 4; });
    assert((kept == std::multiset<int>{4,4,5,5,6,6,7,8,9}));
}
```

Predicate chỉ ra phần tử **không copy**. Sách còn minh họa bỏ các số 3 và bỏ các giá trị lớn hơn 4 khi in ra stream.

## `unique` và `unique_copy`

`std::unique(first,last[,pred])` chỉ gom các phần tử tương đương **liền kề**, trả cuối logic, không thay đổi kích thước container. `unique_copy` ghi kết quả sang đích và trả iterator sau phần đã ghi. Để loại mọi giá trị trùng theo một thứ tự, thường cần sắp xếp trước, rồi dùng `unique` và `erase`; điều đó cũng thay đổi thứ tự dữ liệu.

```cpp
#include <algorithm>
#include <cassert>
#include <vector>

int main() {
    std::vector<int> values{1,4,4,6,1,2,2,3,1,6,6,6,5,7,5,4,4};
    values.erase(std::unique(values.begin(), values.end()), values.end());
    assert((values == std::vector<int>{1,4,6,1,2,3,1,6,5,7,5,4}));
}
```

:::caution Các predicate trong ví dụ sách
Sách minh họa `unique` với `greater<int>` và `unique_copy` với điều kiện “chênh nhau một”. Những quan hệ này không phải equivalence relation; không dùng output được sách quan sát làm bảo đảm portable cho thuật toán yêu cầu predicate biểu diễn tương đương. Ví dụ nén khoảng trắng của sách dùng predicate chỉ đúng khi cả hai ký tự là dấu cách cũng không phải quan hệ tương đương trên toàn bộ ký tự. Để nén khoảng trắng một cách rõ ràng, có thể viết vòng lặp theo trạng thái ký tự trước đó.
:::

Predicate so sánh theo một khóa là một cách hợp lệ để gộp các nhóm tương đương liền kề, miễn quan hệ đó thực sự là quan hệ tương đương trên dữ liệu được dùng. Ví dụ sau giữ bản ghi đầu tiên trong mỗi nhóm cùng khóa; hai nhóm khóa 1 vẫn riêng biệt vì bị khóa 2 ngăn cách:

```cpp
#include <algorithm>
#include <cassert>
#include <vector>

struct Record { int key; char label; };

int main() {
    std::vector<Record> records{{1, 'a'}, {1, 'b'}, {2, 'c'}, {1, 'd'}};
    const auto logicalEnd = std::unique(records.begin(), records.end(),
        [](const Record& a, const Record& b) { return a.key == b.key; });
    records.erase(logicalEnd, records.end());
    assert(records.size() == 3);
    assert(records[0].label == 'a' && records[1].label == 'c');
    assert(records[2].label == 'd');
}
```

Muốn gộp tất cả bản ghi cùng khóa, cần tổ chức chúng thành các nhóm liền kề trước, chẳng hạn dùng `stable_sort` theo khóa. Việc đó thay đổi thứ tự giữa các nhóm và cần phù hợp với yêu cầu bài toán.

Các thuật toán này tuyến tính theo số phần tử, nhưng khả năng áp dụng còn phụ thuộc kiểu iterator, phép gán và điều kiện phạm vi. Với set/map, không thể dùng thuật toán cần ghi đè toàn bộ khóa qua iterator như trên.
