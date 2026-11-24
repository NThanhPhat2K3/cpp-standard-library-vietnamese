---
id: chuong-07-phan-15
title: 'Chương 7 · Comparator chuỗi lúc chạy'
sidebar_label: '07 · Phần 15: Comparator chuỗi'
---

# 7.8.6 · So sánh chuỗi theo tiêu chí chọn lúc chạy

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 351–354 (PDF trang 380–383). Ví dụ được điều chỉnh để tránh lỗi với `std::toupper`.

Ví dụ nâng cao của sách kết hợp `map`, function object, tiêu chí sắp xếp được chọn khi chạy và so sánh chuỗi không phân biệt chữ hoa–thường. Hai map cùng kiểu, nhưng một map dùng thứ tự thông thường và map kia dùng chế độ bỏ qua hoa–thường.

```cpp
#include <algorithm>
#include <cctype>
#include <iomanip>
#include <iostream>
#include <map>
#include <string>

class RuntimeStringCmp {
public:
    enum cmp_mode { normal, nocase };
private:
    cmp_mode mode;
    static bool nocase_compare(char a, char b) {
        return std::toupper(static_cast<unsigned char>(a)) <
               std::toupper(static_cast<unsigned char>(b));
    }
public:
    explicit RuntimeStringCmp(cmp_mode m = normal) : mode(m) {}
    bool operator()(const std::string& a, const std::string& b) const {
        if (mode == normal) return a < b;
        return std::lexicographical_compare(a.begin(), a.end(), b.begin(), b.end(),
                                            nocase_compare);
    }
};
using StringStringMap = std::map<std::string, std::string, RuntimeStringCmp>;

void fillAndPrint(StringStringMap& coll) {
    coll["Deutschland"] = "Germany";
    coll["deutsch"] = "German";
    coll["Haken"] = "snag";
    coll["arbeiten"] = "work";
    coll["Hund"] = "dog";
    coll["gehen"] = "go";
    coll["Unternehmen"] = "enterprise";
    coll["unternehmen"] = "undertake";
    coll["gehen"] = "walk";
    coll["Bestatter"] = "undertaker";
    std::cout << std::left;
    for (const auto& entry : coll)
        std::cout << std::setw(15) << entry.first << ' ' << entry.second << '\n';
    std::cout << '\n';
}

int main() {
    StringStringMap coll1;
    fillAndPrint(coll1);
    RuntimeStringCmp ignorecase(RuntimeStringCmp::nocase);
    StringStringMap coll2(ignorecase);
    fillAndPrint(coll2);
}
```

Với dữ liệu ASCII và locale C mặc định, kết quả tương ứng với sách:

```text
Bestatter       undertaker
Deutschland     Germany
Haken           snag
Hund            dog
Unternehmen     enterprise
arbeiten        work
deutsch         German
gehen           walk
unternehmen     undertake

arbeiten        work
Bestatter       undertaker
deutsch         German
Deutschland     Germany
gehen           walk
Haken           snag
Hund            dog
Unternehmen     undertake
```

Trong cả hai map, phép gán thứ hai cho `gehen` thay `go` bằng `walk`. Trong map không phân biệt hoa–thường, `Unternehmen` và `unternehmen` được coi là khóa tương đương: phép gán thứ hai đổi mapped value của phần tử đã có thành `undertake`, trong khi cách viết khóa ban đầu `Unternehmen` vẫn được giữ. Kết quả vì vậy có ít hơn một phần tử và có thể gây nhầm nghĩa giữa danh từ và động từ tiếng Đức. Sách gợi ý dùng `multimap` nếu muốn giữ nhiều bản dịch; khi đó phải chèn từng cặp, vì multimap không có `operator[]`.

:::caution Giới hạn của ví dụ
Sách truyền trực tiếp `char` vào `toupper`; nếu `char` có giá trị âm khác `EOF`, điều đó có thể gây hành vi không xác định. Ví dụ trên chuyển qua `unsigned char` trước. Phép xử lý này dựa trên từng byte và locale C hiện tại, **không phải** so sánh Unicode không phân biệt hoa–thường: không dùng nó để xử lý tiếng Việt UTF-8 như một bộ so sánh ngôn ngữ hoàn chỉnh. Ngoài ra, locale ảnh hưởng `toupper`; không thay đổi locale theo cách làm kết quả comparator thay đổi khi map vẫn chứa các khóa, vì thứ tự phải nhất quán trong suốt thời gian sử dụng container.
:::

Trong sách, trường `mode` là `const`; ví dụ này giữ trạng thái riêng tư không thay đổi sau khởi tạo nhưng bỏ `const` để comparator có thể được gán trong các tình huống cần thiết. `std::lexicographical_compare` xét từng cặp ký tự và, nếu một chuỗi là tiền tố của chuỗi kia, chuỗi ngắn hơn đứng trước. Comparator vẫn phải thỏa strict weak ordering như đã trình bày trong phần set.
