---
id: chuong-15-phan-8
title: 'Chương 15 · Mở file và định vị'
---

Phần này theo mục 15.9.3–15.9.5, trang 797–802 của sách.

## Các tổ hợp chế độ mở

Bảng dưới mô tả các tổ hợp `openmode` cơ bản của file buffer trong C++11, chưa kể `binary` và `ate`. Các lớp `ifstream` và `ofstream` tự thêm lần lượt `in` và `out` vào mode khi mở.

| Mode | Hành vi | Tương ứng C |
| --- | --- | --- |
| `in` | Đọc; file phải tồn tại. | `r` |
| `out`, `out \| trunc` | Ghi và cắt nội dung; tạo file nếu cần. | `w` |
| `out \| app`, `app` | Ghi nối cuối; tạo file nếu cần. | `a` |
| `in \| out` | Đọc và ghi; file phải tồn tại. | `r+` |
| `in \| out \| trunc` | Đọc và ghi, cắt nội dung; tạo file nếu cần. | `w+` |
| `in \| app`, `in \| out \| app` | Đọc và ghi nối cuối; tạo file nếu cần. | `a+` |

Thêm `binary` để dùng chế độ nhị phân của nền tảng; thêm `ate` để định vị đến cuối ngay sau mở. Các tổ hợp như `trunc | app` không hợp lệ trong bảng sách. Một số implementation cũ có `nocreate`/`noreplace` riêng; không coi chúng là cờ chuẩn C++11. Các chuẩn mới có thể bổ sung lựa chọn khác.

`ate` và `app` không đồng nghĩa: `ate` chỉ đặt vị trí ở cuối **ngay sau khi mở**, sau đó có thể seek đến vị trí khác nếu buffer hỗ trợ; `app` yêu cầu mỗi lần ghi hướng tới cuối file. Lưu ý `ate` không ngăn việc cắt file do các cờ khác: chẳng hạn `ofstream` thêm `out`, và `out` một mình có thể mở theo chế độ cắt nội dung.

Ví dụ sau nhận tên file thử nghiệm và **ghi đè nội dung của file đó**. Nó mở bằng `in | out | ate` để giữ nội dung sau khi tạo, rồi seek về đầu và ghi đè một ký tự:

```cpp
#include <fstream>
#include <string>

int main(int argc, char* argv[]) {
    if (argc != 2) return 1;
    {
        std::ofstream initial(argv[1], std::ios::binary);
        if (!(initial << "abc")) return 1;
        initial.close();
        if (!initial) return 1;
    }
    std::fstream file(argv[1], std::ios::in | std::ios::out |
                               std::ios::binary | std::ios::ate);
    if (!file || file.tellp() != std::streampos(3)) return 1;
    file.seekp(0, std::ios::beg);
    file.put('X');
    file.flush();
    if (!file) return 1;
    file.seekg(0, std::ios::beg);
    std::string result;
    if (!(file >> result) || result != "Xbc") return 1;
    file.close();
    return file ? 0 : 1;
}
```

Nếu mục đích là luôn nối thêm, hãy chọn mode `app` thay vì dựa vào vị trí ban đầu từ `ate`. Trong ví dụ, `binary` và dữ liệu ASCII đơn giản giúp minh họa vị trí byte; không suy rộng thành bảo đảm rằng mọi phép seek số học đều phù hợp với văn bản có chuyển mã.

Lớp stream quyết định giao diện đọc/ghi, còn file buffer nhận mode thực tế. Ví dụ `ifstream` có thể mở với mode bổ sung `out`, nhưng bản thân `ifstream` vẫn cung cấp giao diện input.

## Mở, đóng và tái sử dụng

`open(name, mode)` thử mở file, `is_open()` kiểm tra buffer đang gắn file, `close()` đóng file. Kiểm tra trạng thái stream để phát hiện lỗi mở, đọc, ghi hoặc đóng; `is_open()` một mình không chứng minh các thao tác I/O thành công.

:::note Đính chính sách
Sách nói `open()` không bao giờ xóa trạng thái cũ. Trong C++11, mở thành công bằng file stream gọi `clear()` để đặt lại trạng thái; mở thất bại đặt `failbit`. Dù vậy, cần kiểm tra từng lần mở và xử lý lỗi trước khi tiếp tục.
:::

```cpp
#include <fstream>
#include <iostream>

int main(int argc, char* argv[]) {
    std::ifstream file;
    for (int i = 1; i < argc; ++i) {
        file.open(argv[i]);
        if (!file) {
            std::cerr << "cannot open: " << argv[i] << '\n';
            return 1;
        }
        char c;
        while (file.get(c)) std::cout.put(c);
        if (file.bad() || !std::cout) return 1;
        file.clear(); // xóa trạng thái EOF để kiểm tra việc đóng riêng
        file.close();
        if (!file) return 1;
    }
}
```

Sách dùng cùng ý tưởng để xây dựng chương trình như `cat`. Đoạn trên bổ sung kiểm tra lỗi mở, đọc và ghi.

## Định vị file

| Hàm | Chức năng |
| --- | --- |
| `tellg()`, `tellp()` | Lấy vị trí đọc hoặc ghi. |
| `seekg(pos)`, `seekp(pos)` | Đặt vị trí tuyệt đối đã được biểu diễn bằng position type. |
| `seekg(offset, dir)`, `seekp(offset, dir)` | Đặt vị trí tương đối so với `std::ios::beg`, `cur`, hoặc `end`. |

`g` là get (đọc), `p` là put (ghi). `std::streampos`/`pos_type` không nên được xem đơn giản là chỉ số nguyên: nó có thể mang trạng thái chuyển mã. `std::streamoff`/`off_type` dùng cho offset có dấu. Text mode và mã hóa đa byte có thể hạn chế phép seek theo offset tùy ý; thao tác thất bại cần được kiểm tra. Một số stream như terminal không hỗ trợ định vị.

```cpp
#include <cassert>
#include <sstream>

int main() {
    std::istringstream in("abcdef");
    in.seekg(2, std::ios::beg);
    assert(in && in.get() == 'c');
    std::streampos saved = in.tellg();
    in.seekg(-1, std::ios::end);
    assert(in.get() == 'f');
    in.seekg(saved);
    assert(in && in.get() == 'd');
}
```

Sau khi đọc qua EOF bằng giao diện stream, thường cần xử lý và xóa trạng thái lỗi trước khi seek. Sách cũng nhắc rằng hai giao diện vị trí đọc và ghi có thể cùng tác động đến vị trí chung của file buffer; không giả định chúng luôn độc lập. Truy cập trực tiếp `rdbuf()` có thể không cập nhật state của stream bao quanh theo cách một thao tác đọc trên stream làm.

## File descriptor

Trong môi trường kiểu UNIX, descriptor 0, 1, 2 thường là input, output và error chuẩn. Ở thời C++11, thư viện chuẩn không có constructor file stream portable nhận file descriptor; giải pháp phụ thuộc nền tảng hoặc stream buffer tự viết. Sách bàn một cách triển khai ở mục 15.13.3. Khả năng nền tảng và các phiên bản C++ mới có thể khác, nên không giả định một extension là portable.
