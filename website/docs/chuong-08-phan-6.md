---
id: chuong-08-phan-6
title: 'Chương 8 · Các thao tác chuyên biệt của list'
sidebar_label: '08 · Phần 6: Remove, unique, splice, merge'
---

# 8.8.1 · Các thao tác chuyên biệt của list

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 420–423 (PDF trang 449–452). Các điều kiện của chuẩn được làm rõ trong phần ghi chú.

`list` và `forward_list` cung cấp một số hàm thành viên có cùng mục đích với thuật toán tổng quát nhưng được thiết kế cho danh sách liên kết. Riêng `splice` dưới đây chỉ có ở `list`; `forward_list` dùng `splice_after`.

## `remove` và `remove_if`

- `c.remove(value)` xóa mọi phần tử bằng `value`.
- `c.remove_if(pred)` xóa mọi phần tử mà predicate trả `true`.
- Các phần tử bị xóa bị hủy; thứ tự tương đối của phần tử còn lại được giữ. Iterator và tham chiếu tới phần tử bị xóa mất hiệu lực, còn tới phần tử khác vẫn hợp lệ.
- Predicate hoặc phép so sánh có thể ném; không giả định mọi phần tử đã xóa sẽ được khôi phục. Predicate cần đáp ứng yêu cầu của thao tác và không sửa phần tử qua đối số.

Trong C++11, hai hàm trả `void` như sách mô tả; từ C++20 chúng trả số phần tử đã xóa. Khác với `std::remove` tổng quát, hàm thành viên thực sự xóa phần tử.

## `unique`

`c.unique()` xóa các phần tử trùng **liền kề**; `c.unique(pred)` xác định sự tương đương bằng predicate. Mỗi nhóm giữ phần tử đầu tiên; các phần tử không liền kề sẽ không tự được gom lại. Cả list và forward_list hỗ trợ. Phép so sánh có thể ném; thứ tự các phần tử còn lại được giữ. Từ C++20, hàm trả số phần tử đã xóa.

```cpp
#include <list>

int main() {
    std::list<int> values{1, 1, 2, 1, 1};
    values.unique(); // 1, 2, 1
    values.sort();   // 1, 1, 2
    values.unique(); // 1, 2
    return values.size() == 2 ? 0 : 1;
}
```

Predicate phải đáp ứng yêu cầu quan hệ tương đương của overload. Sách mô tả so sánh phần tử với phần tử trước đó chưa bị xóa; không nên dùng predicate không đối xứng để dựa vào thứ tự đối số.

## `list::splice`

Chuyển nút tới trước `pos` trong list đích; iterator, con trỏ và tham chiếu tới các phần tử chuyển vẫn hợp lệ và nay thuộc list đích. Các list phải có allocator so sánh bằng nhau theo tiền điều kiện của thao tác.

| Overload | Phần tử được chuyển | Điều kiện và độ phức tạp |
|:---|:---|:---|
| `dest.splice(pos, source)` | Tất cả phần tử nguồn. | Nguồn phải khác đích; sau đó nguồn rỗng. Hằng số. |
| `dest.splice(pos, source, it)` | Một phần tử tại `it`. | `it` phải trỏ tới phần tử nguồn; nguồn có thể là đích. Nếu `pos == it` hoặc ngay sau `it`, thao tác không thay đổi nội dung. Hằng số. |
| `dest.splice(pos, source, first, last)` | Phạm vi `[first,last)`. | Phạm vi và `pos` phải hợp lệ; nếu cùng list, `pos` không được nằm trong phạm vi. Hằng số trong cùng list; có thể tuyến tính theo độ dài phạm vi giữa hai list. |

Các overload nhận nguồn lvalue hoặc rvalue; chúng chuyển nút thay vì sao chép giá trị. Không được truyền `end()` làm iterator phần tử nguồn cho overload chuyển một phần tử. Khi đáp ứng tiền điều kiện, `splice` không ném.

Ví dụ chuyển một nút giữa hai list rồi dùng lại iterator tới nút đó:

```cpp
#include <cassert>
#include <iterator>
#include <list>

int main() {
    std::list<int> source{1, 2, 3};
    std::list<int> destination{10, 20};
    auto selected = std::next(source.begin()); // phần tử 2
    int* address = &*selected;

    destination.splice(destination.end(), source, selected);
    assert((source == std::list<int>{1, 3}));
    assert((destination == std::list<int>{10, 20, 2}));
    assert(*selected == 2 && &*selected == address);

    destination.erase(selected); // selected hiện thuộc destination
    assert((destination == std::list<int>{10, 20}));
}
```

Hai list trong ví dụ dùng allocator mặc định tương đương. Iterator `selected` tiếp tục trỏ tới cùng phần tử sau `splice`, nhưng kể từ đó phải dùng nó với list đích. Sau `erase(selected)`, chính iterator và con trỏ tới nút bị xóa không còn hợp lệ.

## `sort`, `merge`, `reverse`

- `sort()` và `sort(comp)` sắp xếp `list` hoặc `forward_list` ổn định: thứ tự tương đối của các phần tử tương đương được giữ. Comparator phải xác định strict weak ordering. Nếu comparator ném, không giả định thứ tự ban đầu được khôi phục.
- `merge(source)` hoặc `merge(source,comp)` trộn hai danh sách **đã sắp xếp theo cùng tiêu chí**, giữ ổn định; phần tử tương đương của đích đứng trước phần tử tương đương của nguồn. Với hai danh sách khác nhau và thao tác thành công, nguồn rỗng. Allocator phải tương thích theo tiền điều kiện; iterator và tham chiếu tới nút được chuyển vẫn hợp lệ. Trộn một list với chính nó không có tác dụng.
- `reverse()` đảo thứ tự các phần tử trong list hoặc forward_list và không ném; iterator và tham chiếu tới phần tử vẫn hợp lệ.

Ví dụ sau cho thấy ý nghĩa của tính ổn định khi hai danh sách chứa các bản ghi có cùng khóa. Cả hai đầu vào đều đã được sắp theo `key` trước khi trộn:

```cpp
#include <cassert>
#include <iterator>
#include <list>

struct Record { int key; char origin; };

int main() {
    std::list<Record> left{{1, 'A'}, {2, 'B'}, {2, 'C'}};
    std::list<Record> right{{2, 'D'}, {3, 'E'}};
    auto byKey = [](const Record& a, const Record& b) {
        return a.key < b.key;
    };
    auto moved = right.begin();
    left.merge(right, byKey);
    assert(right.empty());
    assert(std::next(left.begin(), 1)->origin == 'B');
    assert(std::next(left.begin(), 2)->origin == 'C');
    assert(std::next(left.begin(), 3)->origin == 'D');
    assert(moved->origin == 'D'); // iterator tới nút chuyển vẫn hợp lệ
}
```

Với khóa `2`, thứ tự `B`, `C` được giữ trong danh sách đích và cả hai đứng trước `D` chuyển từ nguồn. Iterator `moved` nay chỉ tới phần tử thuộc `left`; ví dụ dùng allocator mặc định tương đương.

:::caution Không merge dữ liệu chưa sắp xếp
Sách nói việc merge các list chưa sắp có thể hoạt động trong thực tế. Chuẩn yêu cầu các đầu vào đã được sắp theo comparator; không dựa vào hành vi quan sát được khi vi phạm tiền điều kiện này.
:::
