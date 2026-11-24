---
id: chuong-15-phan-10
title: 'Chương 15 · I/O cho kiểu tự định nghĩa'
---

Phần này theo mục 15.11, trang 810–818. Có thể mở rộng stream bằng các hàm tự do `operator<<` và `operator>>` cho kiểu của mình. Trả lại stream để cho phép nối thao tác và kiểm tra trạng thái.

## Output và độ rộng

Nếu in trực tiếp `numerator << '/' << denominator`, width do `setw` thiết lập chỉ áp dụng cho lần chèn đầu tiên, không phải toàn phân số. Sách giải quyết bằng cách tạo string stream tạm, `copyfmt` từ stream đích, đặt width của stream tạm về 0, rồi chèn kết quả như một trường duy nhất vào stream đích.

## Input và xử lý lỗi

Đọc vào biến tạm, xác thực rồi mới cập nhật đối tượng. Ví dụ dưới chấp nhận số nguyên hoặc phân số `n/d`, yêu cầu dấu `/` liền ngay sau tử số, và đặt `failbit` nếu mẫu số bằng 0 hoặc đọc mẫu số thất bại:

```cpp
#include <cassert>
#include <iomanip>
#include <ios>
#include <istream>
#include <ostream>
#include <sstream>

struct Fraction {
    int numerator;
    int denominator;
};

template<class CharT, class Traits>
std::basic_ostream<CharT, Traits>&
operator<<(std::basic_ostream<CharT, Traits>& out, const Fraction& f) {
    std::basic_ostringstream<CharT, Traits> temp;
    temp.copyfmt(out);
    temp.width(0);
    temp << f.numerator << temp.widen('/') << f.denominator;
    return out << temp.str();
}

template<class CharT, class Traits>
std::basic_istream<CharT, Traits>&
operator>>(std::basic_istream<CharT, Traits>& in, Fraction& f) {
    int n = 0, d = 1;
    if (!(in >> n)) return in;
    // Nếu đọc tử số đã chạm EOF, đó vẫn là số nguyên hợp lệ.
    if (!in.eof() && Traits::eq_int_type(in.peek(), Traits::to_int_type(in.widen('/')))) {
        in.get();
        if (!(in >> d)) return in;
    }
    if (d == 0) {
        in.setstate(std::ios_base::failbit);
        return in;
    }
    if (!in.fail()) f = Fraction{n, d};
    return in;
}

int main() {
    std::ostringstream out;
    out << std::left << std::setw(8) << Fraction{19, 100};
    assert(out.str() == "19/100  ");
    Fraction f{7, 8};
    std::istringstream bad("4/0");
    bad >> f;
    assert(bad.fail() && f.numerator == 7 && f.denominator == 8);
    std::istringstream whole("42");
    whole >> f;
    assert(whole);
    assert(f.numerator == 42 && f.denominator == 1);
}
```

Sau dấu `/`, `operator>>` số nguyên mặc định có thể bỏ khoảng trắng; trước dấu `/`, ví dụ dùng `peek` nên không bỏ khoảng trắng. Nếu exception mask chứa `failbit`, `setstate` có thể ném. Ví dụ chỉ minh họa chính sách phân tích; nếu cần quy tắc khoảng trắng khác, phải định nghĩa và kiểm tra riêng.

:::note Lưu ý khi đối chiếu
Ví dụ input trong sách kiểm tra `d == 0` sau khi đọc `d` nhưng chưa kiểm tra phép đọc mẫu số có thành công hay không; nếu phép đọc thất bại, `d` có thể chưa được khởi tạo. Đoạn trên khởi tạo biến và kiểm tra từng phép đọc trước khi dùng.
:::

## Truy cập private và đa hình

Toán tử tự do có thể gọi các hàm thành viên `printOn` và `scanFrom`; nếu cần đa hình qua tham chiếu lớp cơ sở, các hàm thành viên này có thể là `virtual`. Với kiểu không cần đa hình, toán tử có thể là friend khi cần truy cập private. Tránh tự thêm overload vào namespace `std`; toán tử cho kiểu tự định nghĩa nên nằm trong namespace liên quan để argument-dependent lookup tìm thấy. Đối với các kiểu hoàn toàn thuộc `std`, overload trong namespace khác có thể không được tìm thấy từ `ostream_iterator` hoặc code template.

## Cờ định dạng riêng: `xalloc`, `iword`, `pword`

`std::ios_base::xalloc()` cấp một chỉ số dùng chung; mỗi stream có ô `long` truy cập bằng `iword(index)` và ô `void*` bằng `pword(index)`, ban đầu bằng 0. Manipulator có thể đặt giá trị và toán tử output đọc lại, ví dụ chọn in `19 / 100` thay vì `19/100`.

```cpp
#include <cassert>
#include <ios>
#include <ostream>
#include <sstream>

struct Fraction {
    int numerator;
    int denominator;
};
int fractionFlagIndex() {
    static const int index = std::ios_base::xalloc();
    return index;
}
std::ostream& fractionSpaces(std::ostream& out) {
    out.iword(fractionFlagIndex()) = 1;
    return out;
}
std::ostream& fractionCompact(std::ostream& out) {
    out.iword(fractionFlagIndex()) = 0;
    return out;
}
std::ostream& operator<<(std::ostream& out, const Fraction& f) {
    std::ostringstream temp;
    temp.copyfmt(out);
    temp.width(0);
    if (out.iword(fractionFlagIndex()))
        temp << f.numerator << " / " << f.denominator;
    else
        temp << f.numerator << '/' << f.denominator;
    return out << temp.str();
}
int main() {
    std::ostringstream a, b;
    const Fraction value{19, 100};
    a << fractionSpaces << value;
    b << value;
    assert(a.str() == "19 / 100" && b.str() == "19/100");
    a << ' ' << fractionCompact << value;
    assert(a.str() == "19 / 100 19/100");
}
```

`fractionSpaces` và `fractionCompact` chỉ thay ô của stream nhận manipulator, nên `a` và `b` giữ lựa chọn riêng. Trong toán tử output, stream tạm gom cả phân số thành một trường để width của stream đích áp dụng cho toàn bộ kết quả, giống cách làm ở ví dụ đầu trang.

Không giữ lâu tham chiếu trả bởi `iword`/`pword` qua các thao tác có thể làm vùng lưu trữ thay đổi. `copyfmt` sao chép cả các ô và callback; với `pword`, nó sao chép giá trị con trỏ, không sao chép sâu đối tượng. Nếu quản lý tài nguyên qua `pword`, cần thiết kế ownership và callback cho `erase_event`, `imbue_event`, `copyfmt_event`. `copyfmt` gọi callback xóa trên đích trước khi sao chép, rồi callback copy trên dữ liệu được sao chép; callback chạy theo thứ tự ngược đăng ký. Bảng sách dùng tên `copy_event`, tên enum đúng là `copyfmt_event`.

Các callback được đăng ký bằng `register_callback(callback, index)`. Callback nhận loại sự kiện, stream phát sinh sự kiện và số nguyên được đăng ký; số nguyên này có thể dùng để xác định ô `pword` cần xử lý:

| Sự kiện | Thời điểm |
| --- | --- |
| `imbue_event` | Stream được đổi locale bằng `imbue()`. |
| `erase_event` | Stream bị hủy hoặc chuẩn bị nhận định dạng mới qua `copyfmt()`. |
| `copyfmt_event` | Sau khi `copyfmt()` đã sao chép thông tin định dạng và danh sách callback sang stream đích. |

Sách lưu ý không có thao tác hủy đăng ký riêng; đăng ký cùng callback hai lần tạo hai lượt gọi. Callback được đăng ký trong một callback đang chạy không được gọi cho chính lượt thông báo đang diễn ra.

Khi thiết kế toán tử, sách khuyên xét định dạng của stream, đặt state thích hợp khi lỗi, tránh sửa đối tượng đích khi đọc chưa thành công, không tự thêm newline vào output và cân nhắc tính tương thích giữa định dạng đọc và ghi. Sách còn khuyên, nếu có thể, không tiêu thụ ký tự khi phát hiện sai định dạng; với giá trị quá lớn, nên đọc hết trường và báo lỗi theo chính sách thích hợp. Đây là hướng dẫn thiết kế giao diện, không phải bảo đảm tự động của mọi toán tử nhập.
