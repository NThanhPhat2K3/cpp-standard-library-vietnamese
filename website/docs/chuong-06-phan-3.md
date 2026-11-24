---
id: chuong-06-phan-3
title: 'Chương 6 · Associative container có thứ tự'
sidebar_label: '06 · Phần 3: set và map có thứ tự'
---

# 6.2.2 · Associative container có thứ tự

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 177–180 (PDF trang 206–209). Các hộp ghi chú là phần bổ sung.

Các associative container trong mục này tự duy trì phần tử theo một **tiêu chí thứ tự**. Với `set` và `multiset`, chính phần tử là khóa; với `map` và `multimap`, mỗi phần tử là cặp khóa–giá trị và thứ tự dựa trên khóa. Mặc định comparator dùng phép `<`; có thể cung cấp comparator khác phù hợp.

| Container | Phần tử | Khóa tương đương trùng nhau |
|:---|:---|:---|
| `std::set` | Giá trị chính là khóa | Không cho phép |
| `std::multiset` | Giá trị chính là khóa | Cho phép |
| `std::map` | Cặp khóa–giá trị | Không cho phép |
| `std::multimap` | Cặp khóa–giá trị | Cho phép |

Tương đương theo comparator không nhất thiết là `operator==`: hai khóa `a`, `b` tương đương nếu `!comp(a,b) && !comp(b,a)`. Chẳng hạn, một comparator không phân biệt chữ hoa/thường có thể xem hai chuỗi khác nhau theo `==` là tương đương. Comparator phải đáp ứng yêu cầu **strict weak ordering** của container.

Implementation thường dùng cây tìm kiếm cân bằng; tìm kiếm theo khóa có độ phức tạp logarithmic. Sách so sánh trực giác khoảng 10 bước với 1.000 phần tử so với khoảng 500 khi tìm tuyến tính; đây không phải con số đo bắt buộc. Cấu trúc cây cụ thể không được chuẩn yêu cầu. Thứ tự có thể được khai thác để tìm kiếm, không chỉ để in dữ liệu đã sắp.

:::note Khóa và giá trị
Không thể sửa khóa trực tiếp qua iterator của container đang chứa nó, vì điều đó có thể phá bất biến thứ tự. Với `map` và `multimap`, phần **mapped value** (`second`) thường có thể sửa được qua iterator không const; chỉ khóa (`first`) là const. Từ C++17, node handle hỗ trợ một cách trích node, thay khóa rồi chèn lại khi phù hợp.
:::

## Ví dụ `multiset`

```cpp
#include <iostream>
#include <set>
#include <string>

int main() {
    std::multiset<std::string> cities{
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

Các giá trị được duyệt theo comparator, và `multiset` giữ các bản trùng. Theo thứ tự mặc định trong ví dụ sách, lần in đầu là:

```text
Braunschweig Chicago Frankfurt Frankfurt Hanover New York Paris Toronto
```

Sau khi chèn thêm:

```text
Braunschweig Braunschweig Chicago Frankfurt Frankfurt Hanover Hanover London Munich New York Paris Toronto
```

Nếu thay bằng `set`, mỗi lớp tương đương chỉ có một phần tử. Với `unordered_multiset`, không nên mong đợi thứ tự duyệt như trên. `const auto&` cho phép duyệt mà không sao chép từng chuỗi.

## Ví dụ `multimap`

```cpp
#include <iostream>
#include <map>
#include <string>

int main() {
    std::multimap<int, std::string> coll;
    coll = {{5, "tagged"}, {2, "a"}, {1, "this"}, {4, "of"},
            {6, "strings"}, {1, "is"}, {3, "multimap"}};
    for (const auto& elem : coll) {
        std::cout << elem.second << ' ';
    }
    std::cout << '\n';
}
```

Mỗi danh sách con như `{5, "tagged"}` mô tả một cặp khóa–giá trị. Kiểu phần tử là `std::pair<const Key, T>`: `first` là khóa, `second` là giá trị ánh xạ. Khóa `1` được phép xuất hiện hai lần vì đây là `multimap`. Kết quả ví dụ:

```text
this is a multimap of tagged strings
```

Từ C++11, các thao tác được quy định duy trì thứ tự tương đối của các phần tử có khóa tương đương; với cách chèn thông thường, phần tử mới được thêm vào cuối nhóm tương đương. Một số overload có **hint** có quy tắc vị trí riêng, nên không nên áp dụng câu này một cách vô điều kiện cho mọi thao tác chèn.

Sách giới thiệu `map` như associative array ở mục 6.2.4; mục 7.7 và 7.8 đi sâu vào set/multiset và map/multimap. `multimap` cũng có thể biểu diễn từ điển trong đó một khóa có nhiều giá trị.
