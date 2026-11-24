---
id: chuong-13-phan-3
title: 'Chương 13 · Kích thước, truy cập và so sánh string'
---

Phần này theo mục 13.2.5–13.2.7, trang 669–673 của sách. Một số quy tắc thay đổi theo phiên bản chuẩn và có điểm trong sách cần đính chính như ghi chú bên dưới.

## Size và capacity

| Hàm | Ý nghĩa |
| --- | --- |
| `size()`, `length()` | Số phần tử ký tự hiện có; hai hàm cho cùng kết quả. |
| `empty()` | Kiểm tra kích thước bằng 0; thể hiện rõ ý định kiểm tra rỗng. |
| `max_size()` | Giới hạn số phần tử mà đối tượng có thể chứa theo implementation và allocator; vượt giới hạn dẫn tới `std::length_error`. Nó không đảm bảo hệ thống đủ bộ nhớ để đạt giới hạn này. |
| `capacity()` | Số phần tử có thể chứa trong dung lượng hiện được cấp phát trước khi phải tăng bộ nhớ. |

Cấp phát lại tốn thời gian và làm vô hiệu các tham chiếu, con trỏ, iterator trỏ tới phần tử. `reserve(n)` yêu cầu đủ capacity cho ít nhất `n` phần tử, hữu ích khi dự đoán được kích thước:

```cpp
#include <string>

std::string text;
text.reserve(80); // chuẩn bị capacity; size vẫn bằng 0
text += "Hello";
text.shrink_to_fit(); // yêu cầu giảm dung lượng, không bắt buộc được đáp ứng
```

Sách mô tả quy tắc thời C++11: `reserve(n)` với `n` nhỏ hơn capacity là một yêu cầu thu nhỏ không bắt buộc, và `reserve()` không đối số là yêu cầu thu nhỏ cho vừa. Từ C++20, `reserve(n)` không còn giảm capacity khi `n` không lớn hơn capacity; overload không đối số bị phản đối từ C++20 và bị loại bỏ trong C++26. Khi cần bày tỏ ý định thu nhỏ, dùng `shrink_to_fit()` (C++11), cũng chỉ là yêu cầu không bắt buộc. Implementation có thể cấp phát dư để giảm số lần cấp phát lại.

Không nên suy ra mọi tham chiếu đều còn hợp lệ chỉ vì chưa vượt capacity: các thao tác thay đổi string có quy tắc mất hiệu lực riêng. Lấy lại con trỏ hoặc iterator sau thao tác có thể làm mất hiệu lực, kể cả khi implementation cụ thể có vẻ giữ nguyên địa chỉ.

## Truy cập phần tử

`operator[]` và `at()` trả tham chiếu tới phần tử tại chỉ số, có `const` tương ứng với đối tượng. Phần tử đầu ở 0; phần tử cuối của chuỗi không rỗng ở `size() - 1`. `front()` và `back()` có từ C++11.

```cpp
#include <string>

std::string s("abcde");
char& third = s.at(2);  // 'c', có kiểm tra
third = 'X';            // s == "abXde"
char first = s.front(); // 'a', s không rỗng
char last = s.back();   // 'e', s không rỗng
char terminator = s[s.size()]; // '\0' từ C++11
```

- `at(pos)` ném `std::out_of_range` khi `pos >= size()`; `operator[]` không kiểm tra phạm vi như `at()`.
- Từ C++11, đọc `s[s.size()]` cho `charT()` (`'\0'` với `std::string`). Đó là ký tự kết thúc, không phải phần tử nội dung; không được ghi giá trị khác `charT()` vào vị trí này. Chỉ số lớn hơn `size()` không hợp lệ.
- `front()` và `back()` chỉ được gọi khi chuỗi không rỗng.

:::warning Đính chính sách
Sách ghi `front()` của string rỗng trả `'\0'`. Dù `operator[](0)` có thể đọc ký tự kết thúc trong C++11, `front()` có điều kiện tiên quyết string không rỗng; không sử dụng `front()` trên string rỗng. Tương tự, `back()` yêu cầu không rỗng.
:::

Trong ví dụ của sách, `char& r = s[2]` và `char* p = &s[3]` có thể dùng để sửa nội dung tại hai vị trí đó. Sau khi gán giá trị mới hoặc thực hiện thao tác có thể làm mất hiệu lực tham chiếu và con trỏ, không tiếp tục dùng `r` hay `p` nếu chưa xác định chúng còn hợp lệ. Các thao tác như `swap`, nhập bằng `>>` hoặc `getline`, và nhiều hàm thành viên không `const` có thể làm mất hiệu lực. Các hàm truy cập như `operator[]`, `at()`, `begin()`, `end()`, `rbegin()` và `rend()` thuộc nhóm ngoại lệ được sách nêu. C++11 cũng đảm bảo gọi `data()` hay `c_str()` không tự làm mất hiệu lực các tham chiếu đó.

## So sánh

`==` và `!=` so sánh nội dung; các toán tử thứ tự so sánh từ điển theo character traits. Ví dụ, `"aaaa"` đứng trước `"abba"`, còn `"aaaa"` đứng trước `"aaaaaa"` vì là tiền tố ngắn hơn. Có thể so sánh string với C-string hợp lệ.

`compare()` trả số nguyên âm, 0 hoặc dương tùy quan hệ nhỏ hơn, bằng hoặc lớn hơn; không dựa vào giá trị chính xác là -1 hay 1. Các overload cho phép chọn đoạn của một hoặc cả hai chuỗi:

```cpp
#include <cassert>
#include <string>

std::string s("abcd");
assert(s.compare("abcd") == 0);
assert(s.compare("dcba") < 0);
assert(s.compare("ab") > 0);
assert(s.compare(0, 2, s, 2, 2) < 0); // "ab" so với "cd"
assert(s.compare(1, 2, "bcx", 2) == 0); // "bc" so với hai ký tự đầu
```

So sánh theo traits mặc định không tự áp dụng quy tắc ngôn ngữ tự nhiên hoặc không phân biệt hoa thường. Sách gợi ý dùng thuật toán với tiêu chí riêng, traits riêng, hoặc locale và facet collation khi cần. String dùng traits khác là một kiểu khác, nên không tự kết hợp như hai `std::string` thông thường.
