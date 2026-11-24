---
id: chuong-13-phan-1
title: 'Chương 13 · Làm quen với string'
---

Phần này theo chương 13 và mục 13.1 của sách, trang 655–663. Trong chương, **string** là đối tượng của các kiểu chuỗi thư viện chuẩn như `std::string`, `std::wstring`, `std::u16string`, `std::u32string`; **C-string** là chuỗi ký tự kết thúc bằng ký tự null, thường được truy cập qua `char*` hoặc `const char*`.

## Vì sao dùng string?

Các lớp chuỗi quản lý bộ nhớ và thời gian sống cho nội dung của chúng. Ta có thể sao chép, gán, so sánh bằng `==`, hoặc nối bằng `+` như với một kiểu giá trị thông thường. Header là `<string>`, các tên nằm trong namespace `std`.

Literal `"hello"` có kiểu mảng `const char[6]`, gồm năm ký tự và một `\0`. Trong nhiều biểu thức mảng chuyển thành con trỏ `const char*`, nhưng sự khác biệt vẫn quan trọng, đặc biệt khi suy luận tham số template qua tham chiếu; `std::decay` có thể mô phỏng phép chuyển kiểu này. Sách nhắc chuyển ngầm literal sang `char*` từng được cho phép để tương thích nhưng đã bị phản đối; từ C++11 không được dựa vào chuyển đổi đó.

### Những thay đổi C++11 được sách nêu

- Có `front()`, `back()` và `shrink_to_fit()`; thêm các hàm chuyển đổi giữa chuỗi và số.
- Có move semantics, initializer list và hai kiểu `u16string`, `u32string`.
- Gọi `data()` hoặc `c_str()` không còn làm mất hiệu lực các tham chiếu, iterator và con trỏ tới string.
- Ký tự kết thúc mặc định có thể được đọc tại `s[s.size()]`, và `data()` cung cấp dãy ký tự có ký tự kết thúc sau nội dung.
- Các triển khai string chia sẻ bộ đệm theo cách copy-on-write dựa vào đếm tham chiếu không còn đáp ứng các yêu cầu C++11.

## Ví dụ 1: tạo tên tạm

Ví dụ trong sách nhận các tên từ dòng lệnh. Nếu không có dấu chấm, thêm `.tmp`; nếu phần sau **dấu chấm đầu tiên** là `tmp`, đổi thành `xxx`; còn lại thay phần sau dấu chấm bằng `tmp`.

```cpp
#include <iostream>
#include <string>

int main(int argc, char* argv[]) {
    std::string filename, basename, extname, tmpname;
    const std::string suffix("tmp");

    for (int i = 1; i < argc; ++i) {
        filename = argv[i];
        std::string::size_type idx = filename.find('.');
        if (idx == std::string::npos) {
            tmpname = filename + '.' + suffix;
        } else {
            basename = filename.substr(0, idx);
            extname = filename.substr(idx + 1);
            if (extname.empty()) {
                tmpname = filename;
                tmpname += suffix;
            } else if (extname == suffix) {
                tmpname = filename;
                tmpname.replace(idx + 1, extname.size(), "xxx");
            } else {
                tmpname = filename;
                tmpname.replace(idx + 1, std::string::npos, suffix);
            }
        }
        std::cout << filename << " => " << tmpname << '\n';
    }
}
```

Chạy với `prog.dat mydir hello. oops.tmp end.dat` cho:

```text
prog.dat => prog.tmp
mydir => mydir.tmp
hello. => hello.tmp
oops.tmp => oops.xxx
end.dat => end.tmp
```

Đây là thuật toán minh họa của sách, không phải quy tắc xử lý đường dẫn tổng quát: nó tìm dấu chấm **đầu tiên**, kể cả khi tên có nhiều dấu chấm hoặc chứa thư mục.

### Đọc ví dụ

- Các `std::string` mặc định rỗng. Có thể gán từ C-string như `argv[i]`, từ string khác hoặc từ một `char`; phép nối cũng hỗ trợ string, C-string và ký tự trong các tổ hợp phù hợp.
- `find('.')` trả chỉ số lần xuất hiện đầu tiên, hoặc `std::string::npos` nếu không tìm thấy. Kiểu kết quả là `std::string::size_type`, kiểu nguyên không dấu; dùng đúng kiểu này hoặc `auto` để so sánh với `npos` thay vì thu hẹp sang `int`.
- `substr(pos, count)` nhận vị trí đầu và **số lượng** ký tự, không phải vị trí cuối. Bỏ `count` để lấy phần còn lại.
- `empty()` kiểm tra rỗng, `+=` nối thêm, `replace(pos, count, value)` thay đoạn. `size()` và `length()` cùng trả số phần tử ký tự, không phải dung lượng bộ nhớ.

Với các overload thao tác bằng vị trí và độ dài được sách xét, vị trí bằng `size()` có thể chỉ điểm ngay sau ký tự cuối; vị trí lớn hơn kích thước thường ném `std::out_of_range`. Các hàm tìm kiếm thay vì ném sẽ trả `npos` nếu không có vị trí phù hợp. Nếu độ dài yêu cầu vượt phần còn lại, thao tác dùng phần còn lại; `npos` thường được dùng làm độ dài với nghĩa đó.

Vì vậy, nếu không có dấu chấm, `filename.substr(filename.find('.'))` ném `std::out_of_range`, còn `filename.substr(0, filename.find('.'))` trả toàn bộ tên. Mỗi hàm và overload vẫn có điều kiện riêng, cần xem mục tham khảo tương ứng.

## Ví dụ 2: tách từ và in ngược

Chương trình đọc từng dòng, tách từ theo dấu cách, tab, dấu phẩy, chấm và chấm phẩy, rồi in các phần tử ký tự trong từng từ theo thứ tự ngược:

```cpp
#include <iostream>
#include <string>

int main() {
    const std::string delims(" \t,.;");
    std::string line;
    while (std::getline(std::cin, line)) {
        std::string::size_type begin = line.find_first_not_of(delims);
        while (begin != std::string::npos) {
            std::string::size_type end = line.find_first_of(delims, begin);
            if (end == std::string::npos) end = line.length();
            for (std::string::size_type i = end; i > begin; ) {
                std::cout << line[--i];
            }
            std::cout << ' ';
            begin = line.find_first_not_of(delims, end);
        }
        std::cout << '\n';
    }
}
```

Ví dụ `pots & pans` cho `stop & snap` (có dấu cách sau mỗi từ). `getline` đọc đến dấu phân cách dòng, lấy dấu đó khỏi luồng nhưng không đưa vào chuỗi; có thể truyền ký tự phân cách khác làm đối số thứ ba. Do đọc từng dòng, không cần thêm newline vào `delims`.

`find_first_not_of(delims)` tìm ký tự đầu tiên không thuộc tập dấu phân cách; `find_first_of(delims, begin)` tìm dấu phân cách tiếp theo. Nếu không thấy, cuối từ là `length()`. Sau đó tiếp tục tìm từ mới tại vị trí kết thúc vừa tìm. Nếu không còn từ, hàm trả `npos`.

Ví dụ sách dùng chỉ số `int` đếm lùi và ép kiểu `begin`. So sánh trực tiếp chỉ số âm có dấu với `size_type` không dấu có thể làm giá trị âm chuyển thành số không dấu lớn, dẫn đến vòng lặp sai và truy cập ngoài phạm vi. Ở đây vòng lặp dùng `size_type`, kiểm tra `i > begin` **trước** khi giảm, tránh tràn số không dấu và tránh thu hẹp chỉ số sang `int`.

`operator[]` không kiểm tra phạm vi; `at()` kiểm tra và ném ngoại lệ khi chỉ số không hợp lệ. Từ C++11, đọc `s[s.size()]` trả ký tự kết thúc `char()` (`'\0'` cho `string`), không phải phần tử nội dung; không được thay nó bằng giá trị khác. Trước C++11, chỉ số bằng kích thước không hợp lệ với overload không `const` như sách lưu ý.

:::note Ký tự Unicode
`std::string` lưu các phần tử `char`. Nếu chuỗi là UTF-8, một ký tự hiển thị có thể gồm nhiều byte; đảo từng `char` như ví dụ có thể tạo UTF-8 không hợp lệ. Cần xử lý Unicode phù hợp nếu muốn đảo văn bản tiếng Việt.
:::
