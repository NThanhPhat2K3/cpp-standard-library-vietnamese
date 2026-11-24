---
id: chuong-08-phan-5
title: 'Chương 8 · Chèn nhiều, xóa và resize'
sidebar_label: '08 · Phần 5: Chèn nhiều, xóa và resize'
---

# 8.7.2–8.7.4 · Chèn nhiều, xóa và thay kích thước

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 416–420 (PDF trang 445–449). Các điều kiện của từng container được làm rõ thêm.

## 8.7.2 Chèn nhiều phần tử

| Overload | Ý nghĩa | Nhóm |
|:---|:---|:---|
| `c.insert({a,b,...})` | Chèn initializer list; không nhận vị trí. | Associative và unordered container. |
| `c.insert(first,last)` | Chèn các phần tử nguồn `[first,last)`; không nhận vị trí. | Associative và unordered container. |
| `c.insert(pos,{a,b,...})` | Chèn trước `pos`, trả iterator phần tử đầu được chèn hoặc vị trí tương ứng nếu rỗng. | Vector, deque, list, string. |
| `c.insert(pos,n,value)` | Chèn `n` bản sao trước `pos`; trả iterator đầu hoặc vị trí tương ứng nếu `n == 0`. | Vector, deque, list, string. |
| `c.insert(pos,first,last)` | Chèn phạm vi trước `pos`, trả iterator phần tử đầu hoặc vị trí tương ứng nếu phạm vi rỗng. | Vector, deque, list, string. |

Phạm vi nguồn và vị trí phải đáp ứng tiền điều kiện của overload; đặc biệt không mặc định mọi trường hợp phạm vi nguồn nằm trong chính container đích đều hợp lệ. `forward_list` sử dụng các overload `insert_after` riêng.

Chèn vào ordered associative container giữ iterator và tham chiếu tới phần tử cũ; unordered giữ tham chiếu nhưng có thể làm iterator mất hiệu lực khi rehash. Vector và deque có quy tắc phụ thuộc vị trí/reallocation như phần trước; list giữ iterator và tham chiếu tới phần tử cũ. Nếu chèn cả phạm vi và có ngoại lệ, không thể nói chung rằng các phần tử đã chèn trước đó luôn được hoàn tác. Sách nêu bảo đảm mạnh cho một số trường hợp, nhưng phải xét container, overload, kiểu phần tử và nguồn ngoại lệ.

## 8.7.3 Xóa phần tử

### Theo khóa

`erase(key)` trên ordered/unordered associative container xóa **mọi** phần tử có khóa tương đương và trả số lượng đã xóa. Với set/multiset, khóa chính là giá trị; với map/multimap, khóa là `first`. Iterator và tham chiếu tới các phần tử khác vẫn hợp lệ. Comparator, hash hoặc predicate có thể ném tùy loại container và overload.

Với `list` và `forward_list`, hàm thành viên `remove(value)` có vai trò xóa các giá trị phù hợp. Với sequence container khác, có thể dùng erase–remove hoặc `std::erase` từ C++20.

Với `multimap`, cần phân biệt xóa theo khóa và xóa một iterator:

```cpp
#include <cassert>
#include <map>
#include <string>

int main() {
    std::multimap<int, std::string> values{{1, "An"}, {1, "Binh"}, {2, "Chi"}};
    auto first = values.find(1);
    assert(first != values.end());
    values.erase(first);               // chỉ một phần tử
    assert(values.count(1) == 1);
    const auto removed = values.erase(1); // mọi phần tử còn lại với khóa 1
    assert(removed == 1 && values.count(1) == 0);
    assert(values.count(2) == 1);
}
```

Không cần giả định `find(1)` chọn tên nào trong ví dụ: nó chỉ cần trả một phần tử có khóa tương đương. Để xử lý toàn bộ nhóm trước khi xóa, dùng `equal_range(1)` và lưu ý iterator tới phần tử bị xóa không còn hợp lệ.

### Theo iterator hoặc phạm vi

`erase(pos)` xóa phần tử tại `pos`, trả iterator tiếp theo; `pos` phải dereference được, vì vậy `erase(end())` không hợp lệ. `erase(first,last)` xóa `[first,last)` và trả iterator theo sau phần bị xóa; phạm vi phải hợp lệ. Các overload trong sách có ở vector, deque, list, associative container, unordered container và string. `forward_list` dùng `erase_after` với ý nghĩa phạm vi khác.

- Vector: iterator/tham chiếu từ vị trí xóa trở đi bị mất hiệu lực, gồm `end()` cũ.
- Deque: hậu quả phụ thuộc vị trí xóa; xóa giữa có thể làm mất hiệu lực iterator/tham chiếu tới các phần tử còn lại. Khi xóa phần tử cuối, `end()` cũ cũng mất hiệu lực.
- List, ordered và unordered associative container: iterator/tham chiếu tới phần tử **bị xóa** mất hiệu lực; các phần tử khác vẫn hợp lệ.
- Không suy ra mọi overload `erase` đều không ném: ví dụ thao tác dịch chuyển phần tử của vector có thể phụ thuộc phép gán/move của kiểu phần tử.

```cpp
#include <vector>

int main() {
    std::vector<int> values{1, 2, 3, 4};
    for (auto it = values.begin(); it != values.end(); ) {
        if (*it % 2 == 0) it = values.erase(it);
        else ++it;
    }
    return values == std::vector<int>{1, 3} ? 0 : 1;
}
```

### Xóa ở đầu/cuối và xóa hết

`pop_front()` có ở deque, list, forward_list; `pop_back()` có ở vector, deque, list, string. Chúng xóa một phần tử và không trả giá trị đó; gọi khi rỗng vi phạm tiền điều kiện. Các iterator/tham chiếu tới phần tử còn lại thường được giữ theo hợp đồng tương ứng, nhưng không giả định `end()` cũ vẫn hợp lệ, đặc biệt sau `pop_back` của vector hoặc deque.

`clear()` xóa toàn bộ phần tử của các container động và string, hủy chúng và làm mất hiệu lực iterator/tham chiếu tới chúng. Không giả định capacity vector hay bộ nhớ được trả về hệ điều hành; `clear()` không thay đổi kích thước `std::array`.

## 8.7.4 `resize`

`resize(n)` và `resize(n,value)` có ở vector, deque, list, forward_list và string. Chúng thay số phần tử thành `n`:

- Nếu `n` nhỏ hơn kích thước cũ, các phần tử cuối bị hủy.
- Nếu `n` lớn hơn, phần tử mới được thêm cuối: overload không có `value` khởi tạo theo yêu cầu tương ứng; overload kia tạo bản sao của `value`.
- Nếu bằng kích thước hiện tại, nội dung không đổi.

Với vector/deque, việc thay kích thước có thể làm iterator hoặc tham chiếu mất hiệu lực; list/forward_list giữ các iterator/tham chiếu tới phần tử không bị xóa. Điều kiện về ngoại lệ phụ thuộc constructor/move/copy và container. `forward_list` có `resize` dù không có `size()`.
