---
id: chuong-15-phan-15
title: 'Chương 15 · Hiệu năng và sao chép stream'
---

Phần này theo mục 15.14, trang 844–847 của sách. Tối ưu I/O nên dựa trên đo đạc với dữ liệu, nền tảng và implementation thực tế; vẫn cần giữ đúng hành vi đồng bộ và xử lý lỗi mà ứng dụng yêu cầu.

## Đồng bộ C và C++

Tám stream chuẩn C++ được đồng bộ với các stream C tương ứng theo mặc định. `std::ios::sync_with_stdio(false)` yêu cầu tắt đồng bộ; nên gọi trước mọi I/O, vì gọi sau khi I/O đã xảy ra có hành vi phụ thuộc implementation. Hàm trả **trạng thái đồng bộ trước lời gọi**.

:::note Đính chính bảng trong sách
`sync_with_stdio()` không đối số không phải hàm chỉ đọc: đối số mặc định là `true`, nên lời gọi này yêu cầu bật đồng bộ và trả trạng thái trước đó. Không dùng nó như một getter không có tác dụng phụ.
:::

Khi tắt đồng bộ, không dựa vào thứ tự trộn giữa I/O C và C++ như trước; bảo đảm an toàn thread bằng cơ chế thích hợp thay vì dựa vào bảo đảm của stream chuẩn được đồng bộ. Việc tắt đồng bộ có thể giúp hiệu năng nhưng không bảo đảm nhanh hơn trên mọi implementation.

## Buffering và flush

Buffering có thể giảm số thao tác với thiết bị hoặc hệ điều hành. `std::endl`, `std::flush`, cờ `unitbuf` và stream được `tie()` có thể yêu cầu flush thường xuyên; dùng chúng khi cần đồng bộ, thay vì mặc định flush sau mọi dòng. Khi tự viết stream buffer, có thể bắt đầu bằng implementation đơn giản, sau đó đo và bổ sung buffering nếu đó là điểm nghẽn. Không làm `sync()` bỏ qua yêu cầu flush nếu chương trình phụ thuộc vào ngữ nghĩa flush.

## Sao chép qua stream buffer

Sách minh họa hai cách chuyển dữ liệu:

```cpp
std::cout << std::cin.rdbuf();
// hoặc: std::cin >> std::noskipws >> std::cout.rdbuf();
```

Ở dạng `>>`, cần `noskipws` nếu muốn giữ khoảng trắng đầu. Dạng `out << in.rdbuf()` truy cập trực tiếp source buffer và không tự cập nhật đầy đủ trạng thái của input stream bao quanh; trạng thái output cũng có các quy tắc riêng khi không chèn được ký tự. Vì vậy khi cần phân biệt EOF, file rỗng và lỗi đọc/ghi, hãy chọn giao diện và chính sách kiểm tra phù hợp thay vì chỉ giả định một phép chèn chứng minh mọi thứ thành công.

Một điểm dễ nhầm khi kiểm tra file rỗng: phép chèn buffer đặt `failbit` trên output nếu không chèn được ký tự nào, ngay cả khi nguồn chỉ đơn giản là rỗng. Đồng thời, vì đọc trực tiếp qua buffer, input stream bao quanh không tự ghi nhận EOF qua thao tác đó:

```cpp
#include <cassert>
#include <sstream>

int main() {
    std::istringstream empty("");
    std::ostringstream out;
    out << empty.rdbuf();
    assert(out.fail());
    assert(!empty.eof());
}
```

Nếu chương trình cho phép nguồn rỗng, đừng diễn giải riêng `out.fail()` sau phép chèn này là bằng chứng chắc chắn có lỗi thiết bị. Ngược lại, cũng không nên bỏ qua trạng thái output vì việc ghi có thể thất bại. Sự khác nhau giữa thao tác trên stream và buffer là lý do cần chọn cách sao chép theo yêu cầu chẩn đoán lỗi.

Ví dụ sau sao chép theo khối qua giao diện stream, giữ ký tự null và kiểm tra lỗi:

```cpp
#include <cassert>
#include <istream>
#include <ostream>
#include <sstream>
#include <string>

bool copyStream(std::istream& in, std::ostream& out) {
    char buffer[4096];
    while (in.read(buffer, sizeof buffer) || in.gcount() > 0) {
        out.write(buffer, in.gcount());
        if (!out) return false;
    }
    return in.eof() && !in.bad();
}

int main() {
    const std::string data("A\0B\n", 4);
    std::istringstream in(data);
    std::ostringstream out;
    assert(copyStream(in, out));
    assert(out.str() == data);
}
```

Ví dụ giả định exception mask mặc định; nếu bật ngoại lệ, cần xử lý chúng theo chính sách ứng dụng. Với file nhị phân, mở cả nguồn và đích bằng `std::ios::binary` để tránh chuyển đổi text-mode trên nền tảng có phân biệt. Kiểm tra thêm lỗi khi flush/đóng file đích nếu cần xác nhận quá trình ghi.

Sách cũng nêu rằng khi thao tác buffer hoặc facet trực tiếp có thể giảm chi phí sentry trong vòng lặp, nhưng khi đó người viết phải tự đảm bảo các tiền điều kiện và xử lý trạng thái cần thiết. Giao diện cấp thấp không tự động là lựa chọn nhanh nhất hoặc an toàn nhất cho mọi chương trình.
