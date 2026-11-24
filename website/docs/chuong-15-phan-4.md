---
id: chuong-15-phan-4
title: 'Chương 15 · Nhập xuất không định dạng'
---

Phần này theo mục 15.5, trang 767–773. Các hàm I/O không định dạng xử lý trực tiếp ký tự hoặc dãy ký tự; khi đọc, chúng không tự bỏ khoảng trắng đầu như `operator>>` mặc định. Số lượng thường dùng `std::streamsize`, một kiểu số nguyên có dấu.

## Đọc ký tự và dãy ký tự

| Hàm input | Hành vi |
| --- | --- |
| `get()` | Trả ký tự tiếp theo dưới dạng `traits::int_type`, hoặc `traits::eof()`. |
| `get(ch)` | Đọc một ký tự vào `ch`, trả stream để kiểm tra. |
| `get(buf, n, delim)` | Lưu tối đa `n-1` ký tự và thêm null; dừng **trước** dấu phân cách, để nó lại trong stream. |
| `getline(buf, n, delim)` | Lưu tối đa `n-1` ký tự và thêm null; lấy dấu phân cách khỏi stream nhưng không lưu. Nếu hết chỗ trước khi kết thúc dòng, đặt `failbit`. |
| `read(buf, n)` | Yêu cầu đúng `n` ký tự, không thêm null; EOF trước khi đủ đặt `eofbit` và `failbit`. |
| `readsome(buf, n)` | Đọc tối đa `n` ký tự hiện sẵn có trong stream buffer, không thêm null; trả số đã đọc. |
| `gcount()` | Trả số ký tự được xử lý bởi thao tác input không định dạng gần nhất có cập nhật bộ đếm. |

Các overload `get` và `getline` không ghi `delim` dùng newline được widen theo stream. Buffer phải đủ cho số phần tử được truyền, kể cả null khi hàm thêm null. `istream::getline` khác với `std::getline(stream, std::string&)` đã học ở chương 13.

`readsome` có thể trả 0 ngay cả khi về sau sẽ có dữ liệu, nên không dùng kết quả 0 làm bằng chứng chắc chắn rằng đã tới EOF. Tùy giá trị mà stream buffer báo, `readsome` có thể đặt `eofbit`; không nên hiểu nhận xét trong sách là EOF không bao giờ được đặt.

```cpp
#include <cassert>
#include <sstream>
#include <string>

int main() {
    std::istringstream input("abc,def");
    char buffer[8];
    input.get(buffer, 8, ',');
    assert(std::string(buffer) == "abc");
    assert(input.peek() == ','); // get để lại dấu phân cách
    input.get();                 // lấy dấu phẩy
    input.getline(buffer, 8, ',');
    assert(std::string(buffer) == "def");
}
```

Dùng kiểu `int_type` khi gọi `get()` hoặc `peek()` dạng trả giá trị để phân biệt mọi giá trị ký tự với EOF; không thu hẹp về `char` trước khi kiểm tra EOF.

### Dấu phân cách, buffer đầy và `gcount()`

`getline` tính cả dấu phân cách đã lấy khỏi input trong `gcount()`, dù không lưu dấu đó vào mảng; `get(buf, ...)` không lấy dấu phân cách. Nếu `getline` gặp dấu phân cách ngay sau ký tự cuối vừa chứa được, nó vẫn có thể tiêu thụ dấu và thành công. Cần đọc `gcount()` trước một thao tác không định dạng tiếp theo có thể thay đổi bộ đếm, kể cả `peek()`.

```cpp
#include <cassert>
#include <sstream>
#include <string>

int main() {
    char buffer[4];
    std::istringstream input("abc,xy");
    input.getline(buffer, sizeof buffer, ',');
    assert(!input.fail());
    assert(std::string(buffer) == "abc");
    assert(input.gcount() == 4); // ba ký tự và dấu phẩy đã lấy

    char bytes[4] = {};
    input.read(bytes, sizeof bytes); // chỉ còn hai ký tự
    assert(input.gcount() == 2);
    assert(input.eof() && input.fail());
    assert(bytes[0] == 'x' && bytes[1] == 'y');
}
```

`read` không tự thêm null; mảng trong ví dụ được khởi tạo bằng 0 chỉ để thuận tiện quan sát, không làm thay đổi hợp đồng của `read`. Một lần đọc ngắn vẫn có thể cung cấp dữ liệu hợp lệ: xử lý đúng `gcount()` ký tự trước khi xử lý trạng thái EOF hoặc lỗi.

## Bỏ qua và xem trước

`ignore()` bỏ một ký tự; `ignore(count, delim)` bỏ đến `count` ký tự hoặc sau khi lấy cả `delim`, tùy điều kiện đến trước. Dùng `numeric_limits<streamsize>::max()` để bỏ đến dấu phân cách hoặc EOF mà không bị giới hạn bởi `count`:

```cpp
#include <limits>
#include <iostream>

std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
```

`peek()` trả ký tự kế tiếp mà không lấy khỏi stream. `unget()` và `putback(ch)` yêu cầu đưa ký tự về trước vị trí đọc; thành công phụ thuộc stream buffer và trạng thái. `putback` không luôn chỉ chấp nhận đúng ký tự vừa đọc: buffer có thể hỗ trợ thay thế, nhưng không nên dựa vào khả năng đó. Nếu không thể đưa lại, stream báo lỗi. Đừng giả định có thể đưa lại một số lượng ký tự tùy ý.

## Ghi không định dạng

`put(ch)` ghi một ký tự. `write(buf, n)` ghi đúng `n` phần tử từ phạm vi hợp lệ, kể cả null bên trong; `flush()` yêu cầu đồng bộ bộ đệm với đích. Các hàm trả stream để kiểm tra trạng thái. `tellg`/`seekg` và `tellp`/`seekp` quản lý vị trí đọc/ghi khi stream hỗ trợ, được bàn thêm ở phần file.

```cpp
#include <cassert>
#include <sstream>
#include <string>

int main() {
    const char bytes[] = {'A', '\0', 'B'};
    std::ostringstream out;
    out.write(bytes, 3);
    assert(out.str().size() == 3);
    assert(out.str()[1] == '\0');
}
```

Bộ lọc ký tự đơn giản có thể dùng `while (std::cin.get(ch)) std::cout.put(ch);`. Truy cập stream buffer hoặc dùng `istreambuf_iterator`/`ostreambuf_iterator` là lựa chọn khác khi cần xử lý trực tiếp buffer; cần xét xử lý lỗi và hiệu năng thực tế.

## Sentry

Các thao tác I/O thông thường tạo `basic_istream::sentry` hoặc `basic_ostream::sentry` để thực hiện bước chuẩn bị và kết thúc chung, như kiểm tra trạng thái, xử lý stream được tie và, với input có định dạng, bỏ khoảng trắng theo cờ. Input sentry nhận tùy chọn `noskipws`; I/O không định dạng không bỏ khoảng trắng đầu. Khi tự viết thao tác ở mức stream buffer, cần cân nhắc tạo sentry và thực hiện quy tắc trạng thái, ngoại lệ tương ứng. Chi tiết đồng bộ và stream buffer sẽ được bàn tiếp trong chương.
