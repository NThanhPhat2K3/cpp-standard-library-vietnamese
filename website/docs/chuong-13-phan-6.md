---
id: chuong-13-phan-6
title: 'Chương 13 · Iterator và thuật toán trên string'
---

Phần này theo mục 13.2.14, trang 684–689. String là dãy phần tử có thứ tự và cung cấp random-access iterator, nên có thể dùng cùng nhiều thuật toán STL. Kiểu iterator cụ thể phụ thuộc implementation; không giả định nó luôn là con trỏ. Các thay đổi string hoặc cấp phát lại có thể làm iterator mất hiệu lực.

## Các phạm vi và thao tác iterator

| Thao tác | Ý nghĩa |
| --- | --- |
| `begin()`, `end()` | Đầu và vị trí sau cuối của phạm vi xuôi `[begin, end)`. |
| `cbegin()`, `cend()` | Iterator chỉ đọc cho phạm vi xuôi, từ C++11. |
| `rbegin()`, `rend()` | Đầu và vị trí kết thúc của phạm vi duyệt ngược. |
| `crbegin()`, `crend()` | Iterator ngược chỉ đọc, từ C++11. |
| `string(first, last)` | Tạo string từ phạm vi `[first, last)`. |
| `append(first, last)`, `assign(first, last)` | Thêm hoặc gán từ phạm vi. |
| `insert(pos, ch)` | Chèn trước iterator `pos`, trả iterator tới ký tự mới. |
| `insert(pos, count, ch)` | Chèn nhiều bản sao, trả iterator tới vị trí đầu đoạn được chèn. |
| `insert(pos, first, last)` | Chèn phạm vi; cũng có overload initializer list từ C++11. |
| `erase(pos)`, `erase(first, last)` | Xóa ký tự hoặc phạm vi và trả iterator tiếp theo. |
| `replace(first, last, source...)` | Thay phạm vi bằng string, C-string, mảng kèm độ dài, ký tự lặp, phạm vi hoặc initializer list. |

Phạm vi hợp lệ là nửa mở: bao gồm đầu và loại trừ cuối. `push_back()` hỗ trợ `std::back_inserter`, cho phép thuật toán ghi thêm vào cuối string.

## Đổi chữ và tìm không phân biệt hoa thường

```cpp
#include <algorithm>
#include <cctype>
#include <iostream>
#include <string>

int main() {
    std::string s("The zip code of Braunschweig in Germany is 38100");
    std::transform(s.cbegin(), s.cend(), s.begin(),
        [](unsigned char c) { return static_cast<char>(std::tolower(c)); });
    std::transform(s.cbegin(), s.cend(), s.begin(),
        [](unsigned char c) { return static_cast<char>(std::toupper(c)); });
    const std::string needle("Germany");
    auto pos = std::search(s.cbegin(), s.cend(), needle.cbegin(), needle.cend(),
        [](unsigned char a, unsigned char b) {
            return std::toupper(a) == std::toupper(b);
        });
    if (pos != s.cend()) std::cout << "index: " << pos - s.cbegin() << '\n';
}
```

Kết quả là `index: 32`. `transform` ghi kết quả về cùng phạm vi; `search` nhận predicate để so sánh các phần tử. Iterator string hỗ trợ phép trừ để tính chỉ số và cộng chỉ số để tìm vị trí iterator.

Khác với đoạn minh họa gốc dùng trực tiếp `char`, lambda nhận `unsigned char`: các hàm `<cctype>` chỉ nhận `EOF` hoặc giá trị biểu diễn được bằng `unsigned char`. Chúng dùng C locale hiện hành và xử lý từng byte, không phải giải pháp đổi chữ Unicode cho UTF-8. Với locale C++ cụ thể, có thể dùng các overload theo locale và facet tương ứng.

Sách cũng đưa cách tìm bằng regex không phân biệt hoa thường:

```cpp
#include <regex>
#include <string>

std::string s("GERMANY");
std::regex pattern("Germany", std::regex_constants::icase);
std::smatch match;
if (std::regex_search(s, match, pattern)) {
    auto index = match.position();
    // dùng index
}
```

Regex được trình bày chi tiết ở chương 14; quy tắc so sánh phụ thuộc traits và locale của regex, không tự đảm bảo xử lý đầy đủ Unicode.

## Reverse, sort và unique

```cpp
#include <algorithm>
#include <iostream>
#include <string>

int main() {
    const std::string hello("Hello, how are you?");
    std::string s(hello.cbegin(), hello.cend());
    for (char c : s) std::cout << c;
    std::cout << '\n';
    std::reverse(s.begin(), s.end());
    std::cout << "reverse: " << s << '\n';
    std::sort(s.begin(), s.end());
    std::cout << "ordered: " << s << '\n';
    s.erase(std::unique(s.begin(), s.end()), s.end());
    std::cout << "no duplicates: " << s << '\n';
}
```

`unique` dồn các phần tử không trùng **liền kề** lên đầu rồi trả logical end; `erase` mới thực sự thu nhỏ string. Sắp xếp trước làm các phần tử giống nhau nằm cạnh nhau. Thứ tự phụ thuộc giá trị ký tự; các phép đảo và sắp xếp từng byte không tương đương xử lý văn bản UTF-8 theo ký tự hiển thị.

## Đọc stream và gộp khoảng trắng

Ví dụ sách tắt `skipws`, dùng `istream_iterator<char>`, `unique_copy` và `back_inserter` để giữ lại một ký tự đầu trong mỗi dãy khoảng trắng liên tiếp:

```cpp
#include <algorithm>
#include <iostream>
#include <iterator>
#include <locale>
#include <string>

int main() {
    std::string input;
    std::cin.unsetf(std::ios::skipws);
    const std::locale loc = std::cin.getloc();
    std::unique_copy(std::istream_iterator<char>(std::cin),
                     std::istream_iterator<char>(), std::back_inserter(input),
                     [loc](char a, char b) {
                         return std::isspace(a, loc) && std::isspace(b, loc);
                     });
    std::cout << input;
}
```

Ở đây `std::isspace(char, locale)` dùng facet của locale lấy từ stream, khác overload một đối số trong `<cctype>`. Các loại khoảng trắng liên tiếp được coi cùng nhóm; ký tự đầu tiên của nhóm được giữ nguyên, không nhất thiết biến thành dấu cách. Nếu cần quan hệ tương đương theo nghĩa đầy đủ cho predicate của thuật toán, có thể bổ sung `a == b` vào predicate; khi đó những ký tự không phải khoảng trắng giống nhau liên tiếp cũng bị gộp, làm thay đổi hành vi. Với yêu cầu chỉ gộp khoảng trắng và giữ nguyên mọi ký tự khác, vòng lặp tường minh là cách tránh phụ thuộc vào predicate không phản xạ của ví dụ sách.

Một cách thực hiện yêu cầu đó bằng vòng lặp, vẫn dùng locale của stream:

```cpp
#include <cassert>
#include <istream>
#include <locale>
#include <sstream>
#include <string>

std::string compressWhitespace(std::istream& in) {
    const std::locale loc = in.getloc();
    std::string result;
    bool previousWasSpace = false;
    char ch;
    while (in.get(ch)) {
        const bool isSpace = std::isspace(ch, loc);
        if (!isSpace || !previousWasSpace) result.push_back(ch);
        previousWasSpace = isSpace;
    }
    return result;
}

int main() {
    std::istringstream in("aa \t\n bb");
    in.imbue(std::locale::classic());
    assert(compressWhitespace(in) == "aa bb");
}
```

`get(ch)` đọc cả khoảng trắng mà không cần đổi cờ `skipws`; ký tự khoảng trắng đầu tiên trong mỗi nhóm được giữ lại. Ví dụ trả chuỗi đã đọc và để caller kiểm tra trạng thái stream nếu cần phân biệt EOF với lỗi I/O.
