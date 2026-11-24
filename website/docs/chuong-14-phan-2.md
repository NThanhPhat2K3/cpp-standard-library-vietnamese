---
id: chuong-14-phan-2
title: 'Chương 14 · Duyệt kết quả và tách token regex'
---

Phần này theo mục 14.2–14.4, trang 724–729 của sách.

## Tìm nhiều kết quả bằng `regex_search`

Ta có thể tìm trên một phạm vi iterator rồi tiếp tục từ cuối đoạn vừa khớp. Ví dụ sách tìm hai thẻ trên các dòng khác nhau:

```cpp
#include <iostream>
#include <regex>
#include <string>

int main() {
    const std::string data = "<person>\n <first>Nico</first>\n"
                             " <last>Josuttis</last>\n</person>\n";
    const std::regex pattern(R"(<(.*)>(.*)</(\1)>)");
    auto pos = data.cbegin();
    const auto end = data.cend();
    std::smatch m;
    while (std::regex_search(pos, end, m, pattern)) {
        std::cout << m.str(1) << ": " << m.str(2) << '\n';
        pos = m.suffix().first; // với mẫu này, mỗi match có độ dài dương
    }
}
```

Kết quả là `first: Nico` và `last: Josuttis`. `m[0].second` cũng chỉ tới cuối đoạn khớp. `smatch` dùng `string::const_iterator`, nên iterator của phạm vi truyền vào phải tương thích. Nếu mẫu có thể khớp chuỗi rỗng, cách lặp chỉ gán lại cuối match có thể không tiến và chạy vô hạn; dùng `regex_iterator` để xử lý các trường hợp đó theo quy tắc thư viện.

Trong grammar ECMAScript mặc định, `.*` tham lam và không đi qua newline theo cách ví dụ này cần: vì vậy các thẻ con trên từng dòng được tìm thấy. Khi bỏ newline, mẫu có thể khớp toàn bộ thẻ `person` cùng nội dung bên trong. Đây là ví dụ về ảnh hưởng của grammar và tính tham lam, không phải quy tắc rằng regex luôn trả chuỗi dài nhất trong mọi grammar hoặc lựa chọn.

:::note Đính chính ví dụ sách
Trang 726 viết `[^>]*` rồi giải thích là loại ký tự `<`; thực tế `[^>]*` loại `>`. Muốn phần nội dung không chứa dấu mở thẻ `<`, dùng `[^<]*`. Dù vậy, regex đơn giản này vẫn không phải parser XML.
:::

## `regex_iterator`

`std::sregex_iterator` duyệt các match của string; đối tượng mặc định là iterator kết thúc. Dereference trả thông tin match, và `++` tiến đến match tiếp theo.

```cpp
#include <iostream>
#include <regex>
#include <string>

int main() {
    const std::string data("<first>Nico</first> <last>Josuttis</last>");
    const std::regex pattern(R"(<([^<>]+)>([^<]*)</\1>)");
    std::sregex_iterator it(data.cbegin(), data.cend(), pattern), end;
    for (; it != end; ++it)
        std::cout << it->str(1) << ": " << it->str(2) << '\n';
}
```

Regex, phạm vi đầu vào và dữ liệu gốc cần tồn tại trong suốt thời gian iterator được dùng. Có thể truyền iterator vào thuật toán như `std::for_each`. Sách gọi iterator này là bidirectional và nhắc `--`; đây là sai sót: `regex_iterator` là **forward iterator** và không cung cấp `--`.

## `regex_token_iterator`

Token iterator cho phép chọn phần nào của từng match hoặc khoảng giữa các match:

| Chỉ số | Token nhận được |
| --- | --- |
| `-1` | Phần không khớp nằm giữa các match, thường dùng để tách theo dấu phân cách. |
| `0` | Toàn bộ match. |
| `n > 0` | Nhóm bắt thứ `n`. |

Có thể truyền một chỉ số, initializer list, vector hoặc mảng chỉ số. Với danh sách `{0, 2}`, mỗi match được duyệt theo thứ tự toàn bộ match rồi nhóm 2. Iterator mặc định là kết thúc.

Ví dụ theo cách dùng `{0, 2}` trong sách: mỗi cặp token gồm toàn bộ thẻ và nội dung của thẻ đó.

```cpp
#include <cassert>
#include <regex>
#include <string>
#include <vector>

int main() {
    const std::string data = "<first>Nico</first> <last>Josuttis</last>";
    const std::regex pattern(R"(<([^<>]+)>([^<]*)</\1>)");
    std::sregex_token_iterator it(data.cbegin(), data.cend(), pattern, {0, 2});
    const std::sregex_token_iterator end;
    std::vector<std::string> tokens;
    for (; it != end; ++it) tokens.push_back(it->str());
    assert((tokens == std::vector<std::string>{
        "<first>Nico</first>", "Nico", "<last>Josuttis</last>", "Josuttis"}));
}
```

Ở đây nhóm 1 là tên thẻ và nhóm 2 là giá trị; chỉ số 0 luôn chỉ toàn bộ match. Token iterator trả các `sub_match` tham chiếu vào dữ liệu gốc, vì vậy dữ liệu và regex phải còn sống trong lúc duyệt; ví dụ tạo `std::string` mới khi lưu kết quả để không giữ tham chiếu đó.

```cpp
#include <iostream>
#include <regex>
#include <string>

int main() {
    const std::string names("nico, jim; helmut. john paul");
    const std::regex sep("[ \\t\\n]*[,;.][ \\t\\n]*");
    std::sregex_token_iterator it(names.cbegin(), names.cend(), sep, -1), end;
    for (; it != end; ++it) std::cout << "name: " << *it << '\n';
}
```

Mẫu phân cách là dấu phẩy, chấm phẩy hoặc chấm, có thể kèm dấu cách, tab, newline ở hai phía. Vì dấu cách riêng lẻ không phải dấu phân cách, `john paul` vẫn là một token. Sách cũng dùng lớp ký tự `[[:space:]]` thay cho tập dấu cách viết tường minh; kết quả cụ thể phụ thuộc grammar và locale.
