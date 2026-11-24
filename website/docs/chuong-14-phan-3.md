---
id: chuong-14-phan-3
title: 'Chương 14 · Thay thế, cờ và lỗi regex'
---

Phần này theo mục 14.5–14.7, trang 730–736 của sách. Các hằng nằm trong `std::regex_constants` và được chia thành nhóm cấu hình regex, cờ tìm kiếm, và cờ định dạng thay thế.

## Thay thế kết quả khớp

`std::regex_replace` nhận dữ liệu, regex và mẫu thay thế. Mặc định, nó thay mọi match và giữ nguyên phần không khớp. Trong ví dụ sách, tên thẻ là nhóm 1 và giá trị là nhóm 2:

```cpp
#include <cassert>
#include <iterator>
#include <regex>
#include <string>

int main() {
    const std::string data = "<person>\n <first>Nico</first>\n"
                             " <last>Josuttis</last>\n</person>\n";
    const std::regex pattern(R"(<(.*)>(.*)</(\1)>)");
    const std::string replacement = R"(<$1 value="$2"/>)";
    const std::string all = std::regex_replace(data, pattern, replacement);
    assert(all.find("<first value=\"Nico\"/>") != std::string::npos);
    assert(all.find("<last value=\"Josuttis\"/>") != std::string::npos);

    const std::string sed = std::regex_replace(
        data, pattern, R"(<\1 value="\2"/>)", std::regex_constants::format_sed);
    assert(sed == all);

    std::string first;
    std::regex_replace(std::back_inserter(first), data.cbegin(), data.cend(),
                       pattern, replacement,
                       std::regex_constants::format_no_copy |
                       std::regex_constants::format_first_only);
    assert(first == "<first value=\"Nico\"/>");
}
```

Overload dùng output iterator ghi vào đích thay vì trả string mới. `format_first_only` chỉ thay match đầu; `format_no_copy` bỏ phần không khớp khỏi đầu ra. Chọn `format_sed` để dùng cú pháp thay thế kiểu sed thay cho mặc định.

| Ý nghĩa | Mặc định | `format_sed` |
| --- | --- | --- |
| Toàn bộ match | `$&` | `&` |
| Nhóm bắt thứ n | `$n` | `\n` |
| Phần trước match | `` $` `` | — |
| Phần sau match | `$'` | — |
| Dấu `$` literal | `$$` | — |

Trong literal C++ thông thường, dấu `\` và dấu nháy cần escape; raw string giúp biểu diễn trực tiếp. Mẫu thẻ ở đây chỉ minh họa thao tác regex và không phân tích đầy đủ XML.

## Các cờ tạo regex

| Cờ | Ý nghĩa |
| --- | --- |
| `ECMAScript` | Grammar ECMAScript đã điều chỉnh, mặc định. |
| `basic`, `extended` | POSIX BRE và ERE. |
| `awk`, `grep`, `egrep` | Các grammar tương ứng được chuẩn hỗ trợ. |
| `icase` | So khớp không phân biệt hoa thường theo traits/locale. |
| `nosubs` | Không lưu các nhóm bắt trong match results. |
| `optimize` | Gợi ý ưu tiên tốc độ match hơn thời gian tạo regex. |
| `collate` | Phạm vi ký tự như `[a-b]` xét quy tắc sắp xếp theo locale. |

Chọn một grammar và có thể kết hợp các cờ tương thích bằng `|`. Cờ tạo regex khác kiểu với cờ điều khiển thuật toán tìm kiếm hoặc thay thế; truyền vào đúng nơi mà overload yêu cầu.

## Các cờ thuật toán

| Cờ | Tác dụng |
| --- | --- |
| `match_not_null` | Không chấp nhận match có độ dài 0. |
| `match_not_bol`, `match_not_eol` | Không coi ranh giới tương ứng của phạm vi là đầu hoặc cuối dòng cho `^`/`$`. |
| `match_not_bow`, `match_not_eow` | Không coi ranh giới tương ứng là đầu hoặc cuối từ. |
| `match_continuous` | Match phải bắt đầu ngay tại đầu phạm vi. |
| `match_any` | Cho phép một match bất kỳ nếu có nhiều khả năng. |
| `match_prev_avail` | Cho biết iterator ngay trước đầu phạm vi hợp lệ; ảnh hưởng cách xét ranh giới và làm bỏ qua `match_not_bol`, `match_not_bow`. |
| `format_default`, `format_sed` | Chọn cú pháp mẫu thay thế. |
| `format_first_only`, `format_no_copy` | Chỉ thay lần đầu; không sao chép phần không khớp. |

Chỉ đặt `match_prev_avail` khi thật sự có thể giảm iterator đầu phạm vi một cách hợp lệ.

### Ví dụ grammar egrep

Sách dùng hai mẫu phân cách bằng newline trong grammar `egrep` để tìm lệnh LaTeX `index` có một hoặc hai đối số, kết hợp `icase`. Mẫu đầu `\\.*index\{([^}]*)\}` có một nhóm; mẫu thứ hai `\\.*index\{(.*)\}\{(.*)\}` có hai nhóm. Khi ghép thành hai lựa chọn, các nhóm tương ứng có chỉ số 1, 2, 3; có thể lấy `m.str(1) + m.str(2)` làm giá trị, và `m.str(3)` làm mục xem thêm. Đây là ví dụ xử lý đầu vào có cấu trúc đơn giản, không phải parser LaTeX đầy đủ.

```cpp
#include <cassert>
#include <regex>
#include <string>
#include <utility>
#include <vector>

int main() {
    const std::string one = R"(\\[[:alpha:]]*index[{]([^{}[:cntrl:]]*)[}])";
    const std::string two = R"(\\[[:alpha:]]*index[{]([^{}[:cntrl:]]*)[}][{]([^{}[:cntrl:]]*)[}])";
    const std::regex pattern(one + "\n" + two,
                             std::regex_constants::egrep |
                             std::regex_constants::icase);
    const std::string data = "\\index{STL}\n\\SEEINDEX{library}{STL}\n";
    std::vector<std::pair<std::string, std::string>> entries;
    for (std::sregex_iterator it(data.cbegin(), data.cend(), pattern), end;
         it != end; ++it) {
        entries.emplace_back(it->str(1) + it->str(2), it->str(3));
    }
    assert(entries.size() == 2);
    assert(entries[0].first == "STL" && entries[0].second.empty());
    assert(entries[1].first == "library" && entries[1].second == "STL");
}
```

Newline nằm **trong pattern** tạo hai lựa chọn theo grammar `egrep`; đây không phải cách viết lựa chọn nói chung cho mọi grammar. Các nhóm thuộc nhánh không khớp có chuỗi rỗng, nên ví dụ kết hợp nhóm 1 và nhóm 2 để lấy giá trị. Ví dụ giới hạn tên lệnh và nội dung để tránh match xuyên dòng; cách viết dấu ngoặc bằng lớp ký tự cũng phù hợp với thư viện được kiểm tra. Pattern giả định dữ liệu đơn giản và không xử lý đầy đủ dấu ngoặc lồng hoặc escape của LaTeX.

## Ngoại lệ `regex_error`

Việc tạo hoặc xử lý regex có thể ném `std::regex_error`, dẫn xuất từ `std::runtime_error`. `what()` cho thông điệp tùy implementation, `code()` trả mã trong `regex_constants`. Những mã sách liệt kê gồm:

- `error_collate`, `error_ctype`: tên phần tử collation hoặc lớp ký tự không hợp lệ.
- `error_escape`, `error_backref`: escape hoặc backreference không hợp lệ.
- `error_brack`, `error_paren`, `error_brace`: dấu ngoặc tương ứng không cân bằng; `error_badbrace` là nội dung giới hạn lặp không hợp lệ.
- `error_range`: khoảng ký tự không hợp lệ; `error_badrepeat`: toán tử lặp không có biểu thức hợp lệ trước nó.
- `error_space`, `error_complexity`, `error_stack`: thiếu tài nguyên hoặc vượt giới hạn độ phức tạp khi xử lý.

Nên so sánh `e.code()` với các hằng có tên, thay vì phụ thuộc giá trị số hay nội dung thông điệp cụ thể.

```cpp
#include <cassert>
#include <regex>

int main() {
    bool caught = false;
    try {
        const std::regex invalid("[");
    } catch (const std::regex_error& e) {
        caught = true;
        assert(e.code() == std::regex_constants::error_brack);
    }
    assert(caught);
}
```

Thông báo từ `what()` hữu ích khi chẩn đoán nhưng có thể thay đổi giữa các thư viện. Khi nhận pattern từ người dùng, hãy bắt ngoại lệ ở nơi có thể báo lỗi hoặc chọn cách phục hồi phù hợp.
