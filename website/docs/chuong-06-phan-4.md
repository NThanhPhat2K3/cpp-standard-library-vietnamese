---
id: chuong-06-phan-4
title: 'Chương 6 · Unordered container và bảng băm'
sidebar_label: '06 · Phần 4: Unordered container'
---

import useBaseUrl from '@docusaurus/useBaseUrl';

# 6.2.3 · Unordered container

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 180–185 (PDF trang 209–214). Các hộp ghi chú là phần bổ sung.

Unordered container không duy trì thứ tự sắp xếp theo khóa. Khi duyệt, thứ tự phần tử có thể khác giữa các container và có thể thay đổi sau một số thao tác. Hãy dùng chúng khi việc truy cập theo khóa quan trọng hơn thứ tự duyệt.

## Hash và bucket

Một cách triển khai thường gặp dùng **bảng băm**: hàm hash tạo giá trị hash từ khóa, sau đó implementation ánh xạ nó tới một bucket. Nhiều khóa có thể rơi vào cùng bucket; implementation cần xử lý va chạm. Hình của sách minh họa một phương án dùng danh sách liên kết trong bucket:

<figure className="book-figure">
  <img src={useBaseUrl('/img/unordered-hash-figure-6-3.png')} alt="Hàm hash ánh xạ khóa tới các bucket; nhiều khóa có thể ở cùng bucket" />
  <figcaption>Hình 6.3 trong sách: minh họa bảng băm và bucket · trang 181 (PDF trang 210).</figcaption>
</figure>

Tìm kiếm thường có độ phức tạp trung bình hằng số, nhưng trường hợp xấu nhất có thể tuyến tính; hash kém, nhiều va chạm, chi phí hash và bộ nhớ bucket đều ảnh hưởng hiệu năng. Sơ đồ liên kết là mô hình giải thích, không bắt buộc mọi implementation có cùng cấu trúc nội bộ.

| Container | Nội dung | Khóa tương đương trùng nhau |
|:---|:---|:---|
| `unordered_set` | Giá trị là khóa | Không |
| `unordered_multiset` | Giá trị là khóa | Có |
| `unordered_map` | Cặp khóa–giá trị | Không |
| `unordered_multimap` | Cặp khóa–giá trị | Có |

Các container nhận hash function và predicate xác định khóa tương đương; mặc định thường dùng `std::hash<Key>` và `std::equal_to<Key>`. Nếu hai khóa được predicate xem là tương đương, hàm hash phải cho cùng giá trị hash đối với chúng. Sách bàn cách viết hash ở mục 7.9.2.

## Ví dụ `unordered_multiset`

```cpp
#include <iostream>
#include <string>
#include <unordered_set>

int main() {
    std::unordered_multiset<std::string> cities{
        "Braunschweig", "Hanover", "Frankfurt", "New York",
        "Chicago", "Toronto", "Paris", "Frankfurt"
    };
    for (const auto& city : cities) std::cout << city << ' ';
    std::cout << '\n';

    cities.insert({"London", "Munich", "Hanover", "Braunschweig"});
    for (const auto& city : cities) std::cout << city << ' ';
    std::cout << '\n';
}
```

Có thể thấy `Frankfurt` hai lần và các phần tử có khóa tương đương thuộc cùng nhóm, nhưng không dựa vào vị trí của nhóm trong thứ tự duyệt. Sách đưa một đầu ra ví dụ bắt đầu bằng `Paris Toronto Chicago ...`; implementation khác có thể cho thứ tự khác.

Việc chèn có thể gây **rehash**, thay đổi bucket và thứ tự duyệt. `reserve()` cho phép chuẩn bị số bucket phù hợp với số phần tử dự kiến và load factor hiện tại; không nên suy luận nó cấm mọi rehash trong mọi tình huống thay đổi cấu hình. Xóa phần tử không được xem như lời hứa rằng iterator của phần tử bị xóa còn hợp lệ; các quy tắc invalidation cụ thể cần xét theo phép toán.

:::note Nhóm khóa tương đương
Các phần tử tương đương trong unordered multi-container được nhóm liền nhau khi duyệt; chuẩn còn quy định bảo toàn thứ tự tương đối trong những thao tác nhất định. Không suy rộng thành bảo đảm toàn bộ thứ tự duyệt hoặc mọi cách chèn đều theo đúng thứ tự nhập.
:::

## Ví dụ `unordered_map`

Thay `<map>` và `multimap` ở ví dụ trước bằng `<unordered_map>` và `unordered_multimap` cho một container khóa–giá trị không duy trì thứ tự sắp xếp. Sách nhận xét một số implementation có thể tình cờ in khóa nguyên theo thứ tự; đó không phải bảo đảm, cũng không nên giả định `std::hash` mặc định hay chính sách bucket luôn dùng một phép modulo cụ thể.

Ví dụ dưới đây bình phương mapped value, giữ nguyên khóa:

```cpp
#include <iostream>
#include <string>
#include <unordered_map>

int main() {
    std::unordered_map<std::string, double> coll{
        {"tim", 9.9}, {"struppi", 11.77}
    };
    for (auto& elem : coll) {
        elem.second *= elem.second;
    }
    for (const auto& elem : coll) {
        std::cout << elem.first << ": " << elem.second << '\n';
    }
}
```

Phần tử có kiểu `std::pair<const std::string, double>`: `first` là khóa const, `second` là mapped value có thể sửa. Một kết quả có thể in `struppi: 138.533` và `tim: 98.01`, nhưng thứ tự không được bảo đảm; giá trị hiển thị còn phụ thuộc định dạng và số học dấu phẩy động. Một `std::map` với comparator mặc định sẽ duyệt `struppi` trước `tim`.

Các header là `<unordered_set>` cho set/multiset và `<unordered_map>` cho map/multimap. Sách nêu hash mặc định cho nhiều kiểu cơ bản và chuỗi; với kiểu riêng thường cần cung cấp hash và phép tương đương phù hợp. Các chi tiết và ví dụ bổ sung nằm ở mục 7.9.
