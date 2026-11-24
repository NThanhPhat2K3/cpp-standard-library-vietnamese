---
id: chuong-09-phan-4
title: 'Chương 9 · Insert iterator'
sidebar_label: '09 · Phần 4: Insert iterator'
---

# 9.4.2 · Insert iterator

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 454–460 (PDF trang 483–489). Ví dụ được điều chỉnh ở nơi cần thiết để tránh sử dụng iterator mất hiệu lực.

Insert iterator, hay *inserter*, là output iterator adapter: phép ghi `*out = value` làm container **chèn** phần tử thay vì ghi đè một phần tử đã tồn tại. Nhờ đó thuật toán như `std::copy` có thể ghi vào container ban đầu rỗng.

Ở mức giao diện output iterator, thuật toán thường thực hiện `*out = value; ++out;`. Các inserter chuẩn chuyển phép gán thành lời gọi hàm chèn; `operator*` và phép tăng của adapter hỗ trợ cú pháp output iterator. Với general inserter, vị trí nội bộ được cập nhật sau **mỗi lần gán**; không hiểu việc tăng adapter là trực tiếp dịch vị trí trong container.

## Ba loại inserter

| Hàm tạo | Adapter | Thao tác trên container |
|:---|:---|:---|
| `std::back_inserter(c)` | `back_insert_iterator` | `c.push_back(value)` |
| `std::front_inserter(c)` | `front_insert_iterator` | `c.push_front(value)` |
| `std::inserter(c,pos)` | `insert_iterator` | `c.insert(pos,value)`, sau đó cập nhật vị trí |

Container đích phải hỗ trợ hàm thành viên cần thiết. Vector, deque, list và string hỗ trợ back inserter; deque, list và `forward_list` hỗ trợ front inserter. Sách ở trang 455 bỏ sót `forward_list` trong câu liệt kê front inserter, dù trang 457 liệt kê đúng. General inserter dùng `insert(pos,value)` nên không dùng trực tiếp được cho array hoặc forward_list chuẩn.

## Back inserter

```cpp
#include <algorithm>
#include <iostream>
#include <iterator>
#include <vector>

int main() {
    std::vector<int> values;
    auto out = std::back_inserter(values);
    *out = 1; ++out;
    *out = 2; ++out;
    *out = 3;
    *std::back_inserter(values) = 44;
    *std::back_inserter(values) = 55;
    const std::vector<int> source = values;
    std::copy(source.begin(), source.end(), std::back_inserter(values));
    for (int value : values) std::cout << value << ' ';
}
```

Kết quả `1 2 3 44 55 1 2 3 44 55`. Trang 456 của sách dùng `copy(coll.begin(), coll.end(), back_inserter(coll))` sau khi reserve. **Reserve không đủ để làm ví dụ đó an toàn:** ngay cả không reallocate, `push_back` làm iterator `end()` cũ mất hiệu lực; thuật toán đã lưu iterator đó làm đầu cuối nguồn. Ở đây bản sao `source` bảo đảm phạm vi nguồn không bị thay đổi trong khi chèn.

## Front inserter

Front inserter gọi `push_front` cho mỗi giá trị, nên các giá trị lần lượt ghi vào sẽ xuất hiện theo thứ tự ngược lại:

```cpp
#include <algorithm>
#include <iterator>
#include <list>
#include <vector>

int main() {
    std::list<int> values;
    const std::vector<int> source{1, 2, 3};
    std::copy(source.begin(), source.end(), std::front_inserter(values));
    return values == std::list<int>{3, 2, 1} ? 0 : 1;
}
```

Trong ví dụ sách, ghi 1, 2, 3 tạo `3 2 1`; ghi tiếp 44, 55 tạo `55 44 3 2 1`. Sao chép phạm vi ban đầu của list vào đầu list cho `1 2 3 44 55 55 44 3 2 1`, vì chèn đầu list giữ iterator tới các nút ban đầu và iterator cuối. Đây là tính chất của thao tác và container cụ thể, không phải quy tắc chung cho mọi container.

## General inserter

`std::inserter(c,pos)` chèn trước `pos` với sequence container. Sau mỗi lần chèn, adapter nhận iterator kết quả và tăng vị trí nội bộ để lần chèn tiếp theo đi sau phần tử vừa chèn. Với associative/unordered container, vị trí chỉ là hint; comparator hoặc hash/equality quyết định nơi phần tử được lưu.

```cpp
#include <algorithm>
#include <iterator>
#include <list>
#include <set>

int main() {
    std::set<int> source{1, 2, 3, 44, 55};
    std::list<int> dest;
    std::copy(source.begin(), source.end(), std::inserter(dest, dest.begin()));
    std::copy(source.begin(), source.end(), std::inserter(dest, std::next(dest.begin())));
    return dest == std::list<int>{1, 1, 2, 3, 44, 55, 2, 3, 44, 55} ? 0 : 1;
}
```

Với sequence container, general inserter giữ thứ tự các giá trị được ghi. Việc adapter cập nhật iterator của chính nó không bảo vệ các iterator nguồn hoặc iterator khác nếu container đích là cùng container và phép chèn làm chúng mất hiệu lực. Với associative container, hint tốt có thể giúp hiệu năng, nhưng lợi ích phụ thuộc thứ tự dữ liệu và implementation; sách tiếp tục xây dựng một inserter tùy biến ở mục 9.6.
