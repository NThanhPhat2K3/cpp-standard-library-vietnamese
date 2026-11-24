---
id: chuong-15-phan-11
title: 'Chương 15 · Kết nối và chuyển hướng stream'
---

Phần này theo mục 15.12, trang 819–826. `tie()` liên kết lỏng để flush một output stream; `rdbuf()` cho nhiều stream dùng cùng buffer hoặc chuyển hướng nguồn/đích.

## Liên kết bằng `tie()`

`stream.tie()` trả con trỏ tới output stream được tie, hoặc null. `stream.tie(&out)` đặt liên kết và trả con trỏ cũ; `tie(nullptr)` gỡ liên kết. Trước thao tác I/O trên stream được tie, sentry có thể flush stream output liên kết. Mặc định `cin` gắn với `cout`, `wcin` gắn với `wcout`; điều này giúp lời nhắc được đẩy ra trước khi đọc.

Có thể gỡ tie để tránh flush không cần thiết, nhưng khi đó chương trình tương tác phải chủ động flush lời nhắc. Output stream cũng có thể tie tới output stream khác; không tạo chu trình tie, vì flush đệ quy có thể dẫn đến hành vi không xác định.

## Chia sẻ stream buffer

`stream.rdbuf()` lấy con trỏ buffer; overload setter của `basic_ios` thay buffer và trả con trỏ cũ. `std::ostream out(buffer)` tạo stream mới dùng buffer có sẵn. Mỗi stream giữ cờ định dạng và trạng thái riêng, dù cùng gửi dữ liệu tới một buffer:

```cpp
#include <cassert>
#include <iomanip>
#include <ostream>
#include <sstream>

int main() {
    std::ostringstream target;
    std::ostream hexout(target.rdbuf());
    hexout << std::hex << std::showbase << 177;
    target << ' ' << 177; // target vẫn dùng decimal
    hexout.flush();
    assert(target.str() == "0xb1 177");
}
```

Một `ostream` cơ sở không sở hữu buffer được truyền vào; buffer phải sống lâu hơn mọi stream đang dùng nó. Hủy stream cơ sở không tự bảo đảm flush buffer, nên flush khi cần. Các stream như file stream và string stream sở hữu buffer nội bộ của chính chúng; không để stream khác tiếp tục dùng buffer đó sau khi chủ sở hữu bị hủy. Chia sẻ buffer không tự giải quyết đồng bộ thread.

## Chuyển hướng an toàn

Lưu buffer cũ và khôi phục **trước khi** buffer thay thế bị hủy. Có thể dùng RAII để khôi phục cả khi rời scope do ngoại lệ:

```cpp
#include <cassert>
#include <ostream>
#include <sstream>
#include <streambuf>

class BufferRestore {
    std::ostream& stream;
    std::streambuf* old;
public:
    BufferRestore(std::ostream& s, std::streambuf* replacement)
        : stream(s), old(s.rdbuf(replacement)) {}
    ~BufferRestore() { stream.rdbuf(old); }
    BufferRestore(const BufferRestore&) = delete;
    BufferRestore& operator=(const BufferRestore&) = delete;
};

int main() {
    std::ostringstream original, redirected;
    std::ostream out(original.rdbuf());
    {
        BufferRestore restore(out, redirected.rdbuf());
        out << "file output";
        out.flush();
    }
    out << "normal output";
    assert(redirected.str() == "file output");
    assert(original.str() == "normal output");
}
```

Trong ví dụ file thật, mở và kiểm tra file trước khi chuyển hướng; giữ file sống đến sau khi guard khôi phục buffer. Việc cài buffer bằng setter còn ảnh hưởng trạng thái của stream; với exception mask hoặc yêu cầu bảo toàn trạng thái/định dạng đặc biệt, guard cần chính sách lỗi tương ứng. `copyfmt` có thể sao chép định dạng, nhưng không thay thế quản lý vòng đời buffer.

:::note Thứ tự hủy trong ví dụ sách
Ví dụ trang 823 tạo guard trước file cục bộ, nên khi rời scope file bị hủy trước guard. Để tránh khoảng thời gian stream trỏ tới buffer đã hủy, tạo file **trước** guard, như nguyên tắc vòng đời ở trên.
:::

## Đọc và ghi cùng buffer

Có thể tạo `std::filebuf`, mở với `in | out`, rồi truyền cùng buffer cho `std::istream` và `std::ostream`. Hai stream có trạng thái và định dạng riêng, nhưng vị trí của file buffer có thể liên quan chặt chẽ. Khi đổi hướng đọc/ghi, dùng flush/seek theo yêu cầu của file buffer; sau khi đọc tới EOF, xử lý trạng thái stream trước khi tiếp tục. Sách minh họa ghi một dòng, seek về đầu, đọc lại toàn bộ file, rồi thêm dòng kế tiếp. Với file stream hỗn hợp, `std::fstream` thường là giao diện thuận tiện hơn.

Ví dụ sau dùng một `filebuf` và hai stream như sách. Chương trình nhận tên file làm đối số và **ghi đè nội dung file đó**, vì vậy hãy chạy với một file thử nghiệm:

```cpp
#include <fstream>
#include <iostream>
#include <istream>
#include <ostream>
#include <string>

int main(int argc, char* argv[]) {
    if (argc != 2) return 1;
    std::filebuf buffer;
    if (!buffer.open(argv[1], std::ios::in | std::ios::out | std::ios::trunc))
        return 1;
    std::ostream out(&buffer);
    std::istream in(&buffer);

    out << "dong mot\n" << std::flush;
    if (!out) return 1;
    in.seekg(0, std::ios::beg);
    if (!in) return 1;
    std::string line;
    if (!std::getline(in, line)) return 1;
    std::cout << line << '\n';

    // Chuyển hướng từ đọc sang ghi tại cuối file.
    in.clear();
    out.seekp(0, std::ios::end);
    if (!out) return 1;
    out << "dong hai\n" << std::flush;
    if (!out || !buffer.close()) return 1;
}
```

Đây là hai đối tượng stream với cờ trạng thái riêng trên cùng file buffer. `clear()` tác động lên `in`, không tự sửa trạng thái của `out`; cần kiểm tra stream tương ứng sau từng thao tác. File buffer và file phải còn hoạt động cho tới khi hai stream không dùng chúng nữa. Nếu dùng một `fstream` duy nhất, nguyên tắc kiểm tra trạng thái và chuyển hướng đọc/ghi vẫn quan trọng.
