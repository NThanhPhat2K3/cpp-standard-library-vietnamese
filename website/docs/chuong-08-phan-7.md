---
id: chuong-08-phan-7
title: 'Chương 8 · Các thao tác riêng của forward_list'
sidebar_label: '08 · Phần 7: Thao tác forward_list'
---

# 8.8.2 · Các thao tác riêng của `forward_list`

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 423–426 (PDF trang 452–455). Các lỗi cú pháp và kiểu trả về trong sách được đính chính dưới đây.

`forward_list` chỉ duyệt tiến. Để sửa liên kết tới một phần tử, các hàm `_after` nhận vị trí **đứng trước** phần tử đó.

## Vị trí trước đầu

`before_begin()` và `cbefore_begin()` trả iterator tới vị trí đặc biệt trước phần tử đầu, cho phép chèn hoặc xóa ngay đầu danh sách. Có thể tăng iterator này để tới `begin()`, nhưng không được dereference nó. Khi danh sách rỗng, `begin() == end()`; `before_begin()` vẫn hữu ích để chèn đầu.

## Chèn sau một vị trí

| Thao tác | Kết quả |
|:---|:---|
| `insert_after(pos,value)` | Chèn bản sao hoặc move một giá trị sau `pos`; trả iterator phần tử mới. |
| `emplace_after(pos,args...)` | Dựng phần tử sau `pos`; trả iterator phần tử mới. |
| `insert_after(pos,n,value)` | Chèn `n` bản sao; trả iterator phần tử cuối được chèn hoặc `pos` nếu `n == 0`. |
| `insert_after(pos,{...})` | Chèn initializer list; trả iterator cuối hoặc `pos` nếu rỗng. |
| `insert_after(pos,first,last)` | Chèn từ phạm vi nguồn `[first,last)`; trả iterator cuối hoặc `pos` nếu rỗng. |

`pos` phải là vị trí hợp lệ cho thao tác; không dùng `end()` làm vị trí chèn sau. Phạm vi nguồn phải hợp lệ và đáp ứng các yêu cầu của overload. Iterator và tham chiếu tới các phần tử cũ không bị vô hiệu hóa bởi việc chèn. Sách thảo luận bảo đảm thành công hoặc không tác động khi ngoại lệ xảy ra; cần xét overload và phiên bản chuẩn, đặc biệt khi constructor hoặc thao tác người dùng ném.

## Xóa sau một vị trí

`erase_after(pos)` xóa phần tử ngay sau `pos` và trả iterator tới phần tử tiếp theo. Phải có phần tử để xóa: `pos` không thể là `end()` hoặc vị trí của phần tử cuối.

`erase_after(first,last)` xóa khoảng **mở** `(first,last)`, tức loại trừ cả hai đầu; trả iterator tương ứng với `last`. Phạm vi phải hợp lệ. Các iterator và tham chiếu tới phần tử còn lại vẫn hợp lệ.

```cpp
#include <cassert>
#include <forward_list>

int main() {
    std::forward_list<int> items{1, 2, 3};
    auto lastInserted = items.insert_after(items.before_begin(), {7, 8});
    assert(*lastInserted == 8);  // 7 8 1 2 3
    items.erase_after(items.before_begin(), items.end()); // xóa tất cả
    assert(items.empty());
}
```

:::note Đính chính trang 425
Sách ghi chữ ký `erase_after(first,last)` trả `void`, rồi lại nói hàm trả `end`; overload này trả iterator. Ví dụ gốc cũng ghi `coll.erase(...)`, nhưng hàm đúng của `forward_list` là `coll.erase_after(...)`. Khoảng bị xóa là `(first,last)`, không phải `[first,last)`.
:::

## `splice_after`

Các overload chuyển nút từ `source` tới sau `pos`; nguồn có thể là lvalue hoặc rvalue. Iterator, con trỏ và tham chiếu tới phần tử chuyển vẫn hợp lệ, nhưng phần tử chuyển sang container đích. Các allocator phải so sánh bằng nhau theo tiền điều kiện; `pos` phải hợp lệ và không phải `end()`.

| Overload | Phần được chuyển | Điều kiện chính |
|:---|:---|:---|
| `dest.splice_after(pos,source)` | Tất cả nút của nguồn. | Nguồn phải khác đích; nguồn rỗng sau khi thành công. |
| `dest.splice_after(pos,source,before)` | Phần tử ngay sau `before`. | Phải có phần tử sau `before`; nguồn có thể là đích. Với cùng container, nếu `pos` là `before` hoặc phần tử được chuyển, thao tác không đổi. |
| `dest.splice_after(pos,source,first,last)` | Các phần tử trong khoảng mở `(first,last)`. | Phạm vi hợp lệ; nếu cùng container, `pos` không nằm trong phạm vi được chuyển. |

```cpp
#include <cassert>
#include <forward_list>
#include <iterator>

int main() {
    std::forward_list<int> source{1, 2, 3, 4};
    std::forward_list<int> dest{9};
    auto beforeTwo = source.begin();
    dest.splice_after(dest.before_begin(), source, beforeTwo);
    assert((source == std::forward_list<int>{1, 3, 4}));
    assert((dest == std::forward_list<int>{2, 9}));
    dest.splice_after(dest.before_begin(), source, source.before_begin(), source.end());
    assert(source.empty());
    assert((dest == std::forward_list<int>{1, 3, 4, 2, 9}));
}
```

Overload một phần tử là hằng số; việc chuyển cả list hoặc một phạm vi có thể phải duyệt để tìm cuối phạm vi, nên không giả định mọi overload đều có cùng độ phức tạp. Khi tiền điều kiện được đáp ứng, các phép splice này không ném.

### Nhìn rõ hai đầu của phạm vi mở

Ví dụ sau chuyển `(first,last)` trong cùng một list: phần tử `first` và phần tử `last` đều **không** được chuyển. `pos` nằm ngoài phạm vi đang chuyển.

```cpp
#include <cassert>
#include <forward_list>
#include <iterator>

int main() {
    std::forward_list<int> values{1, 2, 3, 4, 5};
    auto first = values.begin();               // 1
    auto last = std::next(values.begin(), 3); // 4
    auto destination = last;                  // sau 4
    values.splice_after(destination, values, first, last);
    assert((values == std::forward_list<int>{1, 4, 2, 3, 5}));
}
```

Ở đây `(first,last)` gồm `2, 3`; sau thao tác hai nút này nằm sau `4`. Không chọn `destination` là `2` hoặc `3` trong ví dụ này, vì `pos` nằm bên trong phạm vi chuyển sẽ vi phạm tiền điều kiện. Không dereference `before_begin()` hoặc `end()`.
