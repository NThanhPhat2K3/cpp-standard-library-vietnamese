---
id: chuong-07-phan-14
title: 'Chương 7 · Các ví dụ map và multimap'
sidebar_label: '07 · Phần 14: Ví dụ map và multimap'
---

# 7.8.5 · Ví dụ `map` và `multimap`

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 345–350 (PDF trang 374–379). Các ví dụ được trình bày lại với cùng dữ liệu và thao tác chính.

## Thuật toán và lambda với map

Sách dùng `std::for_each` hai lần: lần đầu bình phương mapped value bằng tham chiếu có thể sửa, lần thứ hai in bằng tham chiếu hằng để tránh sao chép cặp.

```cpp
#include <algorithm>
#include <iostream>
#include <map>
#include <string>
#include <utility>

int main() {
    std::map<std::string, double> coll{{"tim", 9.9}, {"struppi", 11.77}};
    std::for_each(coll.begin(), coll.end(),
                  [](std::pair<const std::string, double>& elem) {
                      elem.second *= elem.second;
                  });
    std::for_each(coll.begin(), coll.end(),
                  [](const std::map<std::string, double>::value_type& elem) {
                      std::cout << elem.first << ": " << elem.second << '\n';
                  });
}
```

Với định dạng mặc định của ví dụ sách, output là `struppi: 138.533` rồi `tim: 98.01`; các khóa được duyệt theo thứ tự tăng dần. Với C++14 có thể viết tham số generic lambda là `auto&` và `const auto&`.

## Map như bảng giá

Ví dụ sau dùng mã cổ phiếu làm khóa và giá làm giá trị. Sau khi in lần đầu, chương trình tăng gấp đôi giá, rồi đổi tên khóa `VW` thành `Volkswagen`.

```cpp
#include <iomanip>
#include <iostream>
#include <map>
#include <string>

using StringFloatMap = std::map<std::string, float>;

void printStocks(const StringFloatMap& stocks) {
    std::cout << std::left;
    for (const auto& item : stocks)
        std::cout << "stock: " << std::setw(12) << item.first
                  << "price: " << item.second << '\n';
    std::cout << '\n';
}

int main() {
    StringFloatMap stocks;
    stocks["BASF"] = 369.50f;
    stocks["VW"] = 413.50f;
    stocks["Daimler"] = 819.00f;
    stocks["BMW"] = 834.00f;
    stocks["Siemens"] = 842.20f;
    printStocks(stocks);
    for (auto& item : stocks) item.second *= 2;
    printStocks(stocks);
    stocks["Volkswagen"] = stocks["VW"];
    stocks.erase("VW");
    printStocks(stocks);
}
```

Trước khi tăng giá, thứ tự là BASF 369.5, BMW 834, Daimler 819, Siemens 842.2 và VW 413.5. Sau khi tăng gấp đôi, các giá lần lượt là 739, 1668, 1638, 1684.4 và 827. Cuối cùng khóa `VW` được thay bằng `Volkswagen` với giá 827. Như phần trước đã giải thích, cách đổi khóa bằng `operator[]` chỉ phù hợp khi biết khóa cũ tồn tại và chấp nhận hành vi ghi đè nếu khóa mới đã có.

## Multimap như từ điển

Một từ tiếng Anh có thể có nhiều bản dịch tiếng Đức. `multimap` cho phép nhiều phần tử cùng khóa; `equal_range` lấy phạm vi toàn bộ bản dịch của một từ.

```cpp
#include <iostream>
#include <map>
#include <string>

int main() {
    std::multimap<std::string, std::string> dict{
        {"day", "Tag"}, {"strange", "fremd"}, {"car", "Auto"},
        {"smart", "elegant"}, {"trait", "Merkmal"}, {"strange", "seltsam"},
        {"smart", "raffiniert"}, {"smart", "klug"}, {"clever", "raffiniert"}
    };
    for (const auto& entry : dict)
        std::cout << entry.first << " -> " << entry.second << '\n';

    const std::string word = "smart";
    auto range = dict.equal_range(word);
    std::cout << "smart:\n";
    for (auto it = range.first; it != range.second; ++it)
        std::cout << "  " << it->second << '\n';

    std::cout << "raffiniert:\n";
    for (const auto& entry : dict)
        if (entry.second == "raffiniert") std::cout << "  " << entry.first << '\n';
}
```

Bảng khi duyệt theo khóa: `car → Auto`, `clever → raffiniert`, `day → Tag`, `smart → elegant`, `smart → raffiniert`, `smart → klug`, `strange → fremd`, `strange → seltsam`, `trait → Merkmal`. Tìm theo khóa `smart` trả ba giá trị `elegant`, `raffiniert`, `klug`; tìm theo giá trị `raffiniert` bằng cách duyệt trả hai khóa `clever`, `smart`.

Sách dùng `lower_bound(word)` và `upper_bound(word)` cho phạm vi thứ nhất; `equal_range(word)` ở đây tương đương. Tìm theo khóa tận dụng thứ tự của container; tìm theo giá trị cần xét từng cặp nếu không duy trì thêm một chỉ mục khác.

## Tìm theo khóa và theo giá trị

Ví dụ sách so sánh `find` thành viên với thuật toán `std::find_if`:

```cpp
#include <algorithm>
#include <iostream>
#include <map>
#include <utility>

int main() {
    std::map<float, float> coll{{1, 7}, {2, 4}, {3, 2}, {4, 3},
                                {5, 6}, {6, 1}, {7, 3}};
    auto byKey = coll.find(3.0f);
    if (byKey != coll.end())
        std::cout << "key 3.0 found (" << byKey->first << ':' << byKey->second << ")\n";
    auto byValue = std::find_if(coll.begin(), coll.end(),
        [](const std::map<float, float>::value_type& elem) {
            return elem.second == 3.0f;
        });
    if (byValue != coll.end())
        std::cout << "value 3.0 found (" << byValue->first << ':' << byValue->second << ")\n";
}
```

Kết quả là `(3:2)` khi tìm khóa và `(4:3)` khi tìm giá trị. Ví dụ sách dùng tham số lambda `const pair<float,float>&`; phần tử map là `pair<const float,float>`, do đó cách đó có thể tạo một cặp tạm qua chuyển đổi. Dùng `value_type const&` như trên tham chiếu trực tiếp tới phần tử. So sánh float bằng `==` ở đây dùng các giá trị nhỏ biểu diễn chính xác; với dữ liệu tính toán thực tế cần chọn tiêu chí so sánh phù hợp.
