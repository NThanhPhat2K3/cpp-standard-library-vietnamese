---
id: chuong-14-phan-4
title: 'Chương 14 · Grammar và chữ ký các hàm regex'
---

Phần này theo mục 14.8–14.10, trang 738–741. Các ký hiệu dưới đây là nội dung **mẫu regex**, không phải cách escape trong literal C++; dùng raw string khi muốn ghi trực tiếp.

## Cú pháp ECMAScript mặc định

| Biểu thức | Ý nghĩa |
| --- | --- |
| `.` | Một ký tự phù hợp, ngoại trừ các ký tự kết thúc dòng theo grammar. |
| `[abc]`, `[a-z]`, `[^abc]` | Một ký tự thuộc tập, thuộc khoảng, hoặc không thuộc tập. |
| `[[:digit:]]` | Một ký tự thuộc lớp tên `digit`; các lớp phụ thuộc traits/locale. |
| `*`, `?`, `+` | Lặp phần đứng trước lần lượt 0 trở lên, 0 hoặc 1, 1 trở lên. |
| `{n}`, `{n,}`, `{n,m}` | Lặp đúng `n`, ít nhất `n`, hoặc từ `n` đến `m` lần. |
| `a\|b` | Lựa chọn `a` hoặc `b` (dấu gạch đứng trong mẫu không cần backslash). |
| `(pattern)`, `\1` | Nhóm bắt và backreference tới nhóm thứ nhất. |
| `\b`, `\B` | Ranh giới từ và vị trí không phải ranh giới từ. |
| `^`, `$` | Assertion đầu/cuối theo quy tắc grammar và cờ match. |
| `\n`, `\t`, `\f`, `\r`, `\v` | Newline, tab, form feed, carriage return, vertical tab. |
| `\xhh`, `\uhhhh` | Escape hexadecimal với hai hoặc bốn chữ số hex. |

Các quantifier mặc định tham lam; ECMAScript còn cho phép dạng không tham lam như `*?`. `^` và `$` chịu ảnh hưởng grammar, cờ và phiên bản chuẩn: không mặc định xem chúng luôn khớp đầu/cuối mọi dòng bên trong chuỗi. Từ C++17 có cờ `multiline` cho ECMAScript.

:::note Cách đọc bảng
Dòng lựa chọn thể hiện `a|b`: dấu `|` được escape trong mã nguồn Markdown chỉ để không tách ô bảng. Sách in `\uhhh` ở bảng, nhưng escape Unicode ECMAScript dùng **bốn** chữ số hex: `\uhhhh`.
:::

### Các lớp ký tự

| Lớp | Ý nghĩa khái quát |
| --- | --- |
| `alnum`, `alpha`, `digit` | Chữ hoặc số; chữ; chữ số. |
| `blank`, `space` | Khoảng trắng ngang; các ký tự khoảng trắng. |
| `cntrl`, `graph`, `print`, `punct` | Điều khiển; in được không phải space; in được; dấu câu. |
| `lower`, `upper`, `xdigit` | Chữ thường; chữ hoa; chữ số hex. |

Viết lớp trong bracket expression, ví dụ `[[:alpha:]]`, `[[:alnum:]_]`. Escape ECMAScript `\d`, `\s`, `\w` và dạng phủ định `\D`, `\S`, `\W` lần lượt biểu diễn lớp chữ số, khoảng trắng, ký tự từ và phần bù; `\w` gồm chữ, số và dấu gạch dưới theo traits. Chúng không tự giải quyết phân loại Unicode trên chuỗi UTF-8.

```cpp
#include <cassert>
#include <regex>

int main() {
    const std::regex identifier(R"([_[:alpha:]][_[:alnum:]]*)");
    const std::regex date(R"([123]?[0-9]\.1?[0-9]\.20[0-9]{2})");
    assert(std::regex_match("sample_12", identifier));
    assert(std::regex_match("24.12.2010", date));
    assert(!std::regex_match("12sample", identifier));
}
```

Mẫu identifier minh họa cấu trúc cơ bản, không bao phủ mọi quy tắc tên của C++ hiện đại. Mẫu ngày chỉ kiểm tra hình thức gần đúng; không xác thực ngày tháng thực tế.

### Lượng từ tham lam và không tham lam

Sách dùng `(.|\n)*` để biểu diễn một chuỗi có thể chứa cả newline: nhánh `.` xử lý ký tự phù hợp với dấu chấm, nhánh `\n` xử lý newline. Điều này hữu ích để hiểu cách ghép lựa chọn với lượng từ; nó không tự biến regex thành bộ phân tích tài liệu có cấu trúc.

Với ECMAScript, thêm `?` sau lượng từ tạo dạng không tham lam. Có thể quan sát sự khác nhau khi tìm thẻ đầu tiên:

```cpp
#include <cassert>
#include <regex>
#include <string>

int main() {
    const std::string text("<a>one</a><b>two</b>");
    const std::regex greedy(R"(<.*>)");
    const std::regex lazy(R"(<.*?>)");
    std::smatch match;

    assert(std::regex_search(text, match, greedy));
    assert(match.str() == text);
    assert(std::regex_search(text, match, lazy));
    assert(match.str() == "<a>");
}
```

Trong ví dụ này, `.*` lấy đến dấu `>` cuối cùng còn `.*?` dừng ở dấu `>` đầu tiên cho phép mẫu hoàn tất. Quy tắc “tham lam” mô tả thứ tự thử của lượng từ trong ngữ cảnh toàn mẫu; phần mẫu phía sau vẫn có thể buộc engine điều chỉnh lượng ký tự đã lấy. Cả hai mẫu trên đều không kiểm tra cấu trúc HTML.

## Các grammar khác

| Khác biệt | ECMAScript | basic / grep | extended / awk / egrep |
| --- | --- | --- | --- |
| Nhóm | `( )` | `\( \)` | `( )` |
| Giới hạn lặp | `{ }` | `\{ \}` | `{ }` |
| `?`, `+`, `|` là toán tử | Có | Không theo bảng sách | Có |
| Backreference `\n` | Có | Có | Không theo bảng sách |

Newline phân tách các lựa chọn mẫu trong `grep` và `egrep`. Bảng sách nêu word boundary, hex/Unicode escape và các escape lớp ký tự là đặc điểm của ECMAScript; `awk` có thêm escape bát phân và một số escape điều khiển. Luôn chọn grammar trước khi giải thích dấu `\`, ngoặc và lượng từ.

Ví dụ cùng một ý “một hoặc nhiều chữ số” được viết khác nhau giữa basic và extended. Trong basic, ví dụ dùng `\{1,\}`; trong extended dùng `+`:

```cpp
#include <cassert>
#include <regex>

int main() {
    const std::regex basic(R"([[:digit:]]\{1,\})",
                           std::regex_constants::basic);
    const std::regex extended(R"([[:digit:]]+)",
                              std::regex_constants::extended);
    assert(std::regex_match("123", basic));
    assert(std::regex_match("123", extended));
    assert(!std::regex_match("12x", basic));
    assert(!std::regex_match("12x", extended));
}
```

Hai mẫu trên kiểm tra toàn bộ phạm vi vì dùng `regex_match`; đổi sang `regex_search` có thể tìm được `12` bên trong `12x`. Raw string giúp dấu gạch chéo ngược đi thẳng vào pattern, nhưng không làm các grammar trở nên giống nhau.

## Dạng gọi các hàm chính

| Hàm | Đầu vào | Giá trị trả về |
| --- | --- | --- |
| `regex_match(input, [results,] re, [flags])` | String, C-string hoặc cặp iterator | `bool`: toàn bộ phạm vi khớp hay không. |
| `regex_search(input, [results,] re, [flags])` | String, C-string hoặc cặp iterator | `bool`: có đoạn khớp hay không. |
| `regex_replace(input, re, format, [flags])` | String hoặc C-string tương ứng overload | String kết quả. |
| `regex_replace(out, first, last, re, format, [flags])` | Phạm vi iterator và output iterator | Output iterator sau khi ghi kết quả. |

`results` phải có iterator tương ứng dữ liệu: `smatch`/`wsmatch` cho `string`/`wstring`, `cmatch`/`wcmatch` cho con trỏ ký tự tương ứng. Dạng cặp iterator dùng `match_results<Iterator>`. Regex phải là đối tượng `basic_regex` phù hợp; tạo tường minh từ mẫu. Đầu vào, regex và các iterator cần còn hợp lệ theo thời gian sử dụng kết quả.
