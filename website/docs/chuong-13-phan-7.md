---
id: chuong-13-phan-7
title: 'Chương 13 · Character traits và hiệu năng'
---

Phần này theo mục 13.2.15–13.3.1, trang 689–694 của sách.

## Character traits và quốc tế hóa

`basic_string<CharT, Traits, Allocator>` tách kiểu ký tự khỏi các quy tắc thao tác trên ký tự thông qua `Traits`. Vì không thể thêm phương thức vào các kiểu có sẵn như `char`, lớp traits định nghĩa các phép như so sánh, tìm và sao chép. Cùng một kiểu ký tự có thể dùng traits khác nhau. Sách bàn thêm về literal ký tự ở mục 3.1.6 và traits ở mục 16.1.4.

Ví dụ sau phỏng theo sách: kế thừa `std::char_traits<char>` và đổi các phép `eq`, `lt`, `compare`, `find` để so sánh không phân biệt chữ hoa thường theo C locale hiện hành.

```cpp
#include <cassert>
#include <cctype>
#include <cstddef>
#include <iostream>
#include <set>
#include <sstream>
#include <string>

struct ignorecase_traits : std::char_traits<char> {
    static int upper(char c) {
        return std::toupper(static_cast<unsigned char>(c));
    }
    static bool eq(char a, char b) { return upper(a) == upper(b); }
    static bool lt(char a, char b) { return upper(a) < upper(b); }
    static int compare(const char* a, const char* b, std::size_t n) {
        for (std::size_t i = 0; i < n; ++i) {
            if (!eq(a[i], b[i])) return lt(a[i], b[i]) ? -1 : 1;
        }
        return 0;
    }
    static const char* find(const char* s, std::size_t n, const char& c) {
        for (std::size_t i = 0; i < n; ++i) {
            if (eq(s[i], c)) return s + i;
        }
        return nullptr;
    }
};

using icstring = std::basic_string<char, ignorecase_traits>;

std::ostream& operator<<(std::ostream& out, const icstring& s) {
    return out << std::string(s.data(), s.size());
}

int main() {
    icstring a("hallo"), b("otto"), c("hALLo");
    std::cout << std::boolalpha << (a == b) << ' ' << (a == c) << '\n';
    auto pos = a.find("All");
    if (pos != icstring::npos) std::cout << "index: " << pos << '\n';

    std::set<icstring> names{a, c, b};
    assert(names.size() == 2); // hallo và hALLo tương đương theo traits
    const char bytes[] = {'A', '\0', 'b'};
    icstring withNull(bytes, 3);
    std::ostringstream out;
    out << withNull;
    assert(out.str().size() == 3 && out.str()[1] == '\0');
}
```

Kết quả là `false true` và `index: 1`. Phiên bản này chuyển `char` sang `unsigned char` trước khi gọi `std::toupper`, tránh truyền giá trị âm không hợp lệ. Đây là minh họa theo từng byte và C locale, không phải so sánh Unicode không phân biệt hoa thường. Nếu locale thay đổi, thứ tự hoặc quan hệ bằng nhau có thể thay đổi; tránh dùng tiêu chí phụ thuộc trạng thái thay đổi trong một container có thứ tự đang chứa dữ liệu.

`icstring` và `std::string` là hai kiểu khác nhau vì traits khác. Stream thông thường cũng dùng traits mặc định, nên sách định nghĩa `operator<<` riêng bằng cách tạo string thường từ `data()` và `size()`; dạng có độ dài giữ được null nằm trong nội dung. Input cũng cần giải pháp tương ứng. Để so sánh theo quy tắc ngôn ngữ, xem locale và collation ở chương 16.

Ví dụ `set` cho thấy hệ quả của thay đổi traits: hai chuỗi khác chữ hoa thường được comparator mặc định của `set<icstring>` coi là tương đương, nên chỉ một chuỗi được lưu. Nội dung gốc vẫn giữ nguyên chữ hoa thường; traits thay đổi cách so sánh và tìm, không tự biến đổi dữ liệu đã lưu. Nếu muốn cho phép cả hai cách viết, cần một tiêu chí sắp xếp và định nghĩa tương đương khác.

## Hiệu năng và sự khác biệt với vector

Chuẩn đặt ra giao diện và các yêu cầu hành vi, để implementation chọn cấu trúc nội bộ. Tốc độ, dung lượng và tối ưu cho chuỗi ngắn có thể khác nhau. C++11 đặt các yêu cầu về tham chiếu, iterator và tính đồng thời khiến cách triển khai copy-on-write chia sẻ bộ đệm khi sao chép thông thường không còn phù hợp với `std::string`.

Sách nêu vector thường được dùng để thao tác phần tử, còn string có nhiều thao tác xử lý chuỗi như một giá trị hoàn chỉnh. Cả hai cung cấp iterator và có thể quản lý một dãy liên tục, nhưng không nên coi chúng là cùng một kiểu container: giao diện, ký tự kết thúc, quy tắc mất hiệu lực và các thao tác chuyên biệt khác nhau. Sách có nhắc string dùng reference counting như một ví dụ lịch sử; không áp dụng kết luận đó cho cách triển khai copy-on-write của string phù hợp C++11.

## Kiểu thành viên và `npos`

Các tên dưới đây thuộc một specialization `basic_string`; kiểu cụ thể có thể thay đổi theo traits, allocator và phiên bản chuẩn.

| Tên | Ý nghĩa |
| --- | --- |
| `traits_type`, `value_type` | Traits và kiểu phần tử ký tự. |
| `size_type`, `difference_type` | Kiểu không dấu cho kích thước/chỉ số và kiểu có dấu cho hiệu iterator. |
| `reference`, `const_reference` | Tham chiếu tới phần tử và tham chiếu chỉ đọc. |
| `pointer`, `const_pointer` | Kiểu con trỏ được khai báo của string. |
| `iterator`, `const_iterator` | Iterator thường và chỉ đọc; kiểu chính xác phụ thuộc implementation. |
| `reverse_iterator`, `const_reverse_iterator` | Iterator duyệt ngược tương ứng. |
| `npos` | Giá trị đặc biệt cho kết quả không tìm thấy hoặc độ dài đến hết, tùy ngữ cảnh. |

Với `std::string` thông thường, phần tử là `char`, tham chiếu là `char&` hoặc `const char&`; sách mô tả `size_type` tương ứng `size_t` và `difference_type` tương ứng `ptrdiff_t`. Không giả định iterator là con trỏ thuần hoặc mọi allocator tùy biến có cùng các alias trong mọi phiên bản chuẩn. `npos` có kiểu `size_type`, bằng giá trị không dấu lớn nhất của kiểu đó.
