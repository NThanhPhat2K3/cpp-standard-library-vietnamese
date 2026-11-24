---
id: chuong-13-phan-5
title: 'Chương 13 · Tìm kiếm và chuyển đổi số'
---

Phần này theo mục 13.2.11–13.2.13, trang 678–683 của sách.

## Các hàm tìm kiếm

Các hàm thành viên tìm chỉ số trong string, trả `npos` nếu không tìm thấy. Giá trị tìm có thể là string, C-string hợp lệ, mảng ký tự kèm độ dài hoặc một ký tự. Chúng hỗ trợ vị trí bắt đầu; overload mảng nhận thứ tự `(chars, pos, count)`, trong đó `count` là số ký tự của **giá trị cần tìm**, kể cả null bên trong.

| Hàm | Kết quả khi tìm thấy |
| --- | --- |
| `find(value, pos)` | Vị trí đầu tiên của chuỗi con hoặc ký tự, tìm từ `pos` về phía cuối. |
| `rfind(value, pos)` | Vị trí xuất hiện cuối cùng có chỉ số bắt đầu không lớn hơn `pos`; mặc định tìm từ phía cuối. |
| `find_first_of(set, pos)` | Vị trí đầu tiên có ký tự thuộc tập `set`. |
| `find_last_of(set, pos)` | Vị trí cuối cùng có ký tự thuộc tập `set`, tìm ngược từ `pos`. |
| `find_first_not_of(set, pos)` | Vị trí đầu tiên có ký tự không thuộc `set`. |
| `find_last_not_of(set, pos)` | Vị trí cuối cùng có ký tự không thuộc `set`, tìm ngược từ `pos`. |

Các hàm `_of` xét **từng ký tự thuộc tập**, không tìm cả chuỗi con. Không tìm thấy trả `std::string::npos`; vị trí của chuỗi con là vị trí ký tự đầu. Ví dụ của sách:

```cpp
#include <cassert>
#include <string>

int main() {
    std::string s("Hi Bill, I'm ill, so please pay the bill");
    assert(s.find("il") == 4);
    assert(s.find("il", 10) == 13);
    assert(s.rfind("il") == 37);
    assert(s.find_first_of("il") == 1);
    assert(s.find_last_of("il") == 39);
    assert(s.find_first_not_of("il") == 0);
    assert(s.find_last_not_of("il") == 36);
    assert(s.find("hi") == std::string::npos);
}
```

Có thể dùng thuật toán STL với comparator riêng, hoặc regex của chương 14 cho mẫu phức tạp. Tên và ý nghĩa của các thuật toán tìm kiếm STL không hoàn toàn giống hàm thành viên string.

Một ứng dụng của hai hàm `not_of` là bỏ một tập ký tự ở đầu và cuối. Ở đây tập được chọn tường minh là dấu cách, tab và xuống dòng; nó không đại diện cho mọi khoảng trắng Unicode:

```cpp
#include <cassert>
#include <string>

std::string trim(const std::string& text) {
    const std::string whitespace(" \t\n\r");
    const auto first = text.find_first_not_of(whitespace);
    if (first == std::string::npos) return std::string();
    const auto last = text.find_last_not_of(whitespace);
    return text.substr(first, last - first + 1);
}

int main() {
    assert(trim(" \tHello world\n") == "Hello world");
    assert(trim(" \t\n").empty());
    assert(trim("").empty());
    assert(trim("x") == "x");
}
```

Cần kiểm tra `first == npos` trước khi tính độ dài: điều đó xử lý cả chuỗi rỗng lẫn chuỗi chỉ gồm ký tự cần bỏ. `substr` nhận vị trí bắt đầu và **số ký tự**, nên khoảng từ `first` đến `last` bao gồm cả hai đầu có độ dài `last - first + 1`.

### Tìm trong dữ liệu có null và khoảng rỗng

Overload nhận con trỏ cùng `count` không dừng ở null bên trong giá trị tìm; overload C-string không có `count` xem null là dấu kết thúc. Chuỗi rỗng cũng là một giá trị tìm hợp lệ: `find("", pos)` trả `pos` nếu `pos <= size()`, và trả `npos` nếu `pos` lớn hơn kích thước.

```cpp
#include <cassert>
#include <string>

int main() {
    const std::string data("A\0BC\0B", 6);
    const char needle[] = {'\0', 'B'};
    assert(data.find(needle, 0, 2) == 1);
    assert(data.rfind(std::string(needle, 2)) == 4);
    assert(data.find("", data.size()) == data.size());
    assert(data.find("", data.size() + 1) == std::string::npos);
}
```

Với tìm ngược, `pos` giới hạn **chỉ số bắt đầu** của match, không phải vị trí cuối của match. Khi tìm nhiều lần từ phải sang trái, phải xử lý riêng match ở vị trí 0 để tránh `pos - 1` bị quấn về giá trị không dấu rất lớn.

```cpp
#include <cassert>
#include <string>
#include <vector>

int main() {
    const std::string text("ababa");
    std::vector<std::string::size_type> positions;
    auto pos = text.rfind("aba");
    while (pos != std::string::npos) {
        positions.push_back(pos);
        if (pos == 0) break;
        pos = text.rfind("aba", pos - 1);
    }
    assert((positions == std::vector<std::string::size_type>{2, 0}));
}
```

Ví dụ vẫn tìm được các match chồng lấn vì lần tìm sau bắt đầu trước **vị trí bắt đầu** của match trước một ký tự. Nếu ứng dụng cần match không chồng lấn, phải chọn quy tắc dịch vị trí khác.

## `npos` và kiểu chỉ số

`npos` là hằng `size_type` có giá trị lớn nhất của kiểu không dấu đó, được khởi tạo từ `-1`. Kiểu `size_type` phụ thuộc kiểu string; không nên gán kết quả tìm kiếm sang `int` hoặc một kiểu không dấu hẹp hơn rồi mới so sánh, vì chuyển đổi có thể làm mất thông tin. Sách cũng bàn cách dùng `int` với hằng `-1`, nhưng giải pháp đó không tổng quát khi chỉ số vượt phạm vi `int`.

```cpp
std::string s("one two");
auto pos = s.find("two"); // hoặc std::string::size_type
if (pos != std::string::npos) {
    // pos là chỉ số hợp lệ tìm được
}
```

Nếu chỉ cần biết có tìm thấy hay không, có thể so sánh trực tiếp `s.find(...)` với `std::string::npos`. Trong các hàm khác, `npos` cũng có thể có nghĩa “đến hết phần còn lại” khi truyền làm độ dài; ý nghĩa phụ thuộc tham số của từng hàm.

## Chuyển đổi từ string sang số

Từ C++11, các hàm sau có overload cho `std::string` và `std::wstring`, không có overload tương ứng cho `u16string` hay `u32string` trong giao diện sách mô tả:

| Kiểu kết quả | Hàm |
| --- | --- |
| Số nguyên có dấu | `stoi`, `stol`, `stoll` |
| Số nguyên không dấu | `stoul`, `stoull` |
| Số thực | `stof`, `stod`, `stold` |

Hàm bỏ khoảng trắng đầu, phân tích phần tiền tố hợp lệ và có thể trả chỉ số ký tự đầu tiên chưa xử lý qua con trỏ `std::size_t*`. Nếu không chuyển đổi được ký tự nào, hàm ném `std::invalid_argument`; nếu kết quả ngoài phạm vi kiểu đích, ném `std::out_of_range`. Các hàm số nguyên nhận thêm cơ số, mặc định là 10; có thể dùng 0 để nhận diện cơ số từ tiền tố theo quy tắc của hàm chuyển đổi nền.

```cpp
#include <cassert>
#include <string>

int main() {
    std::size_t pos = 0;
    assert(std::stoi(" 77") == 77);
    assert(std::stod(" 77.7") > 77.0);
    assert(std::stoi("-0x77") == 0); // cơ số mặc định 10: chỉ đọc -0
    assert(std::stoi(" 42 is the truth", &pos) == 42 && pos == 3);
    assert(std::stoi(" 42", nullptr, 16) == 66);
    assert(std::stol("789", &pos, 8) == 7 && pos == 1);
    assert(std::stoi("-0x77", nullptr, 0) == -119);
}
```

Ví dụ cuối của sách đổi giá trị `long long` lớn nhất thành chuỗi rồi gọi `stoi`: nếu giá trị vượt phạm vi `int`, sẽ ném `out_of_range`. Nội dung `what()` của ngoại lệ phụ thuộc implementation. Nếu yêu cầu toàn bộ đầu vào là một số, kiểm tra thêm chỉ số trả về và xử lý khoảng trắng cuối theo quy tắc ứng dụng; chuyển đổi thành công không có nghĩa toàn chuỗi đã được tiêu thụ.

## Chuyển số sang chuỗi

`std::to_string(value)` tạo `std::string`, còn `std::to_wstring(value)` tạo `std::wstring`, với các overload số nguyên và số thực chuẩn được sách liệt kê. Định dạng số thực và ảnh hưởng của locale phụ thuộc phiên bản chuẩn và hàm cụ thể; không dùng kết quả mặc định làm định dạng trao đổi dữ liệu nếu ứng dụng yêu cầu biểu diễn ổn định.
