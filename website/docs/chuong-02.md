---
id: chuong-02
title: Giới thiệu về C++ và thư viện chuẩn
sidebar_label: '02 · C++ và thư viện chuẩn'
---

# Chương 2 · Giới thiệu về C++ và thư viện chuẩn

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, Chương 2, trang 7–11 (trang PDF 36–40). Các hộp “Góc nhìn hiện đại” là phần bổ sung, không thuộc nguyên tác.

Chương này bàn về lịch sử và các phiên bản C++, đồng thời giới thiệu ký pháp Big-O dùng để biểu thị hiệu năng và khả năng mở rộng của các phép toán trong thư viện.

## 2.1 Lịch sử các tiêu chuẩn C++

Việc chuẩn hóa C++ được Tổ chức Tiêu chuẩn hóa Quốc tế (ISO) bắt đầu vào năm 1989. ISO là tổ chức tập hợp các cơ quan tiêu chuẩn quốc gia, chẳng hạn ANSI tại Hoa Kỳ. Tính đến thời điểm cuốn sách được viết, công việc này tạo ra bốn cột mốc sau, được hỗ trợ ở các mức độ khác nhau trên nhiều nền tảng:

1. **C++98**, được phê chuẩn năm 1998, là tiêu chuẩn C++ đầu tiên. Tên chính thức là *Information Technology — Programming Languages — C++*, số hiệu ISO/IEC 14882:1998.
2. **C++03** là một bản sửa lỗi kỹ thuật (*technical corrigendum*, viết tắt TC), gồm các sửa đổi nhỏ cho C++98. Số hiệu là ISO/IEC 14882:2003. Vì thế, C++98 và C++03 đều được xem là thuộc “tiêu chuẩn C++ đầu tiên”.
3. **TR1** gồm các phần mở rộng thư viện cho tiêu chuẩn đầu tiên. Tên chính thức là *Information Technology — Programming Languages — Technical Report on C++ Library Extensions*, số hiệu ISO/IEC TR 19768:2007. Các phần mở rộng trong báo cáo này nằm trong namespace `std::tr1`.
4. **C++11**, được phê chuẩn năm 2011, là tiêu chuẩn C++ thứ hai theo cách gọi trong sách. Nó cải tiến đáng kể cả ngôn ngữ lẫn thư viện; các phần mở rộng TR1 đã trở thành một phần của namespace `std`. Tiêu đề chính thức vẫn là *Information Technology — Programming Languages — C++*, với số hiệu mới ISO/IEC 14882:2011.

Cuốn sách trình bày C++11. Trước đó, phiên bản này trong thời gian dài mang tên làm việc **C++0x**, vì người ta kỳ vọng nó hoàn tất muộn nhất vào năm 2009. Hai tên này chỉ cùng một phiên bản; trong sách tác giả dùng tên C++11. Chú thích của tác giả nói đùa rằng cuối cùng `x` đã trở thành chữ số thập lục phân `b`.

Vì tại thời điểm viết sách một số nền tảng và môi trường chưa hỗ trợ đầy đủ các tính năng ngôn ngữ lẫn thư viện của C++11, tác giả ghi rõ khi một tính năng hoặc hành vi chỉ xuất hiện từ C++11.

### 2.1.1 Các câu hỏi thường gặp về tiêu chuẩn C++11

#### Có thể tìm tiêu chuẩn ở đâu?

Theo sách, bản dự thảo C++11 miễn phí cuối cùng có mã tài liệu **N3242**. Bản dự thảo đủ dùng với phần lớn người dùng và lập trình viên; ai cần văn bản tiêu chuẩn chính thức thì phải mua từ ISO hoặc một cơ quan tiêu chuẩn quốc gia.

#### Tại sao quá trình chuẩn hóa mất nhiều thời gian?

Bạn có thể thắc mắc tại sao quá trình chuẩn hóa cho mỗi tiêu chuẩn đều kéo dài từ mười năm trở lên mà kết quả vẫn chưa hoàn hảo. Theo tác giả, tiêu chuẩn là kết quả của việc nhiều người và công ty đề xuất cải tiến, thảo luận, chờ các bản triển khai để kiểm thử và giải quyết những vấn đề phát sinh khi các tính năng kết hợp với nhau.

Không ai được thuê toàn thời gian chỉ để làm tiêu chuẩn C++ mới; đây cũng không phải sản phẩm của một công ty với ngân sách lớn và nhiều thời gian. Các tổ chức tiêu chuẩn trả rất ít hoặc không trả công cho người tham gia. Nếu không làm việc cho một công ty có lợi ích đặc biệt liên quan đến tiêu chuẩn, người tham gia làm việc này vì đam mê. Tác giả trân trọng những người đã dành thời gian và tiền bạc để đóng góp: khoảng 50–100 người thường xuyên gặp nhau khoảng ba lần mỗi năm, mỗi lần một tuần, để thảo luận và hoàn tất công việc; trong thời gian còn lại, họ trao đổi qua email.

Vì vậy, kết quả không hoàn hảo hoặc nhất quán tuyệt đối về thiết kế. Nó có thể dùng được trong thực tế, nhưng cũng như mọi thứ khác, không hoàn hảo. Phần mô tả thư viện chuẩn chiếm khoảng 50% tiêu chuẩn đầu tiên và tăng lên khoảng 65% ở tiêu chuẩn thứ hai; với C++11, số trang mô tả thư viện tăng từ khoảng 350 lên khoảng 750.

Tiêu chuẩn có nhiều nguồn đóng góp: công ty, quốc gia và cả cá nhân đều có thể đề xuất tính năng hoặc phần mở rộng, sau đó phải được tổ chức chuẩn hóa chấp thuận. Về nguyên tắc, không có gì được thiết kế hoàn toàn từ đầu. Chú thích của tác giả giải thích rằng mục đích chính của chuẩn hóa không phải phát minh hay phát triển cái mới, mà là hài hòa những thực hành đã có.

Kết quả vì thế không hoàn toàn đồng nhất: các thành phần khác nhau có thể theo đuổi những nguyên tắc thiết kế khác nhau. Ví dụ, lớp chuỗi và STL — một khuôn khổ dành cho cấu trúc dữ liệu và thuật toán — có cách tiếp cận khác nhau:

- **Các lớp chuỗi** được thiết kế thành thành phần an toàn và thuận tiện, với giao diện tương đối dễ hiểu và kiểm tra nhiều lỗi ở giao diện.
- **STL** được thiết kế để kết hợp nhiều cấu trúc dữ liệu và thuật toán trong khi đạt hiệu năng tốt nhất. Do đó nó không phải lúc nào cũng thuận tiện và không bắt buộc kiểm tra nhiều lỗi logic. Muốn tận dụng sức mạnh và hiệu năng của STL, bạn cần hiểu và áp dụng cẩn thận các khái niệm của nó.

Cả hai thuộc cùng một thư viện. Chúng đã được điều chỉnh để hòa hợp hơn phần nào, nhưng vẫn giữ những triết lý thiết kế cơ bản riêng.

Dù vậy, một mục tiêu khác của C++11 là đơn giản hóa. Nhiều đề xuất được đưa vào nhằm xử lý các vấn đề, điểm thiếu nhất quán và khiếm khuyết được phát hiện trong thực tế. Chẳng hạn, cách khởi tạo giá trị và đối tượng được thống nhất hơn. Lớp smart pointer `auto_ptr`, vốn có những vấn đề nghiêm trọng, được thay thế bằng nhiều lớp smart pointer tốt hơn. Các thiết kế này trước đó đã được phát triển và thử nghiệm trong Boost, nơi cung cấp các thư viện C++ mã nguồn tự do, có thể chuyển đổi giữa các nền tảng và được cộng đồng đánh giá, trước khi xem xét đưa vào tiêu chuẩn hoặc một bản sửa lỗi kỹ thuật.

:::note Góc nhìn hiện đại
Đoạn trên phản ánh cách nhìn và tình hình khi sách được viết. Đừng suy ra rằng mọi thao tác chuỗi đều kiểm tra lỗi: chẳng hạn, `std::string::operator[]` và `std::string::at()` có hợp đồng kiểm tra khác nhau. `std::auto_ptr` đã bị loại khỏi tiêu chuẩn từ C++17; hãy chọn smart pointer theo quyền sở hữu, thường là `std::unique_ptr` hoặc `std::shared_ptr`.
:::

#### Đây có phải tiêu chuẩn C++ cuối cùng?

C++11 không phải điểm kết thúc. Khi viết sách, người ta đã có các bản sửa lỗi, yêu cầu bổ sung và đề xuất tính năng mới. Vì thế tác giả dự đoán sẽ có thêm bản sửa lỗi kỹ thuật, có thể có “TR2” hoặc tiêu chuẩn thứ ba trong tương lai.

:::note Góc nhìn hiện đại
Đây là dự đoán lịch sử. Sau C++11 đã có các phiên bản tiêu chuẩn tiếp theo như C++14, C++17, C++20 và C++23. Tính năng thực sự dùng được còn phụ thuộc vào chế độ biên dịch và mức hỗ trợ của trình biên dịch, thư viện chuẩn.
:::

### 2.1.2 Tương thích giữa C++98 và C++11

Một mục tiêu thiết kế của C++11 là tương thích ngược với C++98: về nguyên tắc, mã biên dịch được với C++98 hoặc C++03 cũng nên biên dịch được với C++11. Tuy nhiên có ngoại lệ; ví dụ, tên biến không còn được trùng với các từ khóa mới.

Nếu muốn mã hoạt động với nhiều phiên bản C++ nhưng tận dụng cải tiến của C++11 khi có thể, ta có thể kiểm tra macro định nghĩa sẵn `__cplusplus`. Khi biên dịch một đơn vị dịch C++ ở chế độ C++11, giá trị được quy định là:

```cpp
#define __cplusplus 201103L
```

Trong khi đó, cả C++98 và C++03 đều dùng:

```cpp
#define __cplusplus 199711L
```

Tuy nhiên, tác giả lưu ý rằng đôi khi các nhà cung cấp trình biên dịch báo giá trị khác. Hai dòng trên minh họa giá trị do trình biên dịch cung cấp; thông thường bạn **kiểm tra** macro này, không tự định nghĩa lại nó.

Tương thích ngược ở đây chỉ áp dụng cho **mã nguồn**, không đảm bảo tương thích nhị phân. Điều này đặc biệt gây vấn đề khi một phép toán có kiểu trả về mới, vì C++ không cho phép nạp chồng chỉ dựa trên kiểu trả về. Theo sách, điều này xảy ra với một số thuật toán STL và hàm thành viên container. Vì vậy, biên dịch lại toàn bộ các phần của chương trình C++98, bao gồm thư viện, bằng trình biên dịch C++11 thường sẽ hoạt động; còn liên kết mã biên dịch bằng trình biên dịch C++11 với mã biên dịch bằng trình biên dịch C++98 có thể thất bại.

## 2.2 Độ phức tạp và ký pháp Big-O

Ở một số phần của thư viện chuẩn C++, đặc biệt là STL, hiệu năng của thuật toán và hàm thành viên được xem xét kỹ. Tiêu chuẩn vì thế đặt ra yêu cầu về độ phức tạp của chúng. Khoa học máy tính dùng một ký pháp chuyên biệt để biểu thị độ phức tạp tương đối của thuật toán, giúp phân loại thời gian chạy và so sánh định tính: đó là **Big-O**.

Sách mô tả Big-O như cách biểu thị thời gian chạy theo kích thước đầu vào `n`. Ví dụ, nếu thời gian tăng tuyến tính theo số phần tử — gấp đôi đầu vào làm thời gian gấp đôi — độ phức tạp là `O(n)`. Nếu thời gian không phụ thuộc kích thước đầu vào, độ phức tạp là `O(1)`.

| Loại | Ký pháp | Ý nghĩa |
|:---|:---|:---|
| Hằng số | `O(1)` | Thời gian không phụ thuộc số phần tử. |
| Logarit | `O(log n)` | Thời gian tăng theo logarit của số phần tử. |
| Tuyến tính | `O(n)` | Thời gian tăng cùng tỷ lệ với số phần tử. |
| N nhân log N | `O(n log n)` | Thời gian tăng theo tích của phần tuyến tính và logarit. |
| Bậc hai | `O(n²)` | Thời gian tăng theo bình phương số phần tử. |

*Bảng 2.1 — Các mức độ phức tạp thường gặp, dịch từ sách, trang 10.*

Big-O bỏ qua các hệ số hằng và các số hạng tăng chậm hơn. Theo thước đo này, hai thuật toán tuyến tính đều thuộc cùng một loại dù thời gian chạy thực tế có thể khác nhau. Thậm chí với đầu vào cụ thể, một thuật toán tuyến tính có hệ số rất lớn có thể chậm hơn một thuật toán mũ có hệ số nhỏ. Đây là một hạn chế của cách so sánh bằng Big-O: nó là công cụ định hướng, không đảm bảo thuật toán có độ phức tạp tốt nhất sẽ nhanh nhất trong mọi trường hợp thực tế.

Bảng dưới đây, giữ nguyên các con số minh họa trong sách, cho thấy tốc độ tăng theo số phần tử. Với đầu vào nhỏ, chênh lệch có thể ít và các hệ số bị Big-O bỏ qua có thể ảnh hưởng lớn. Khi số phần tử tăng, khác biệt về tốc độ tăng thường trở nên đáng kể hơn. Tác giả khuyên hãy “nghĩ lớn” khi xét độ phức tạp.

| Loại | Ký pháp | 1 | 2 | 5 | 10 | 50 | 100 | 1.000 | 10.000 |
|:---|:---|---:|---:|---:|---:|---:|---:|---:|---:|
| Hằng số | `O(1)` | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 |
| Logarit | `O(log n)` | 1 | 2 | 3 | 4 | 6 | 7 | 10 | 13 |
| Tuyến tính | `O(n)` | 1 | 2 | 5 | 10 | 50 | 100 | 1.000 | 10.000 |
| N nhân log N | `O(n log n)` | 1 | 4 | 15 | 40 | 300 | 700 | 10.000 | 130.000 |
| Bậc hai | `O(n²)` | 1 | 4 | 25 | 100 | 2.500 | 10.000 | 1.000.000 | 100.000.000 |

*Bảng 2.2 — Thời gian chạy minh họa theo độ phức tạp và số phần tử, dịch từ sách, trang 11.*

:::note Góc nhìn hiện đại
Big-O là một **cận trên tiệm cận**, không tự nó nói thời gian thực tế hay trường hợp tốt nhất/trung bình/xấu nhất; cần xem hợp đồng cụ thể của phép toán. Bảng trên chỉ là ví dụ minh họa tăng trưởng, không phải phép đo hay giá trị chính xác của một công thức logarit duy nhất.
:::

### Độ phức tạp trung bình phân bổ

Một số độ phức tạp trong tài liệu tham chiếu C++ được ghi là **amortized** — trung bình phân bổ. Điều đó có nghĩa là khi xét một chuỗi đủ dài các phép toán, tổng chi phí thể hiện độ phức tạp đã nêu; một phép toán riêng lẻ vẫn có thể tốn nhiều thời gian hơn.

Ví dụ, khi thêm phần tử vào cuối một mảng động, thời gian phụ thuộc vào việc còn đủ bộ nhớ cho phần tử mới hay không. Nếu còn chỗ, việc thêm vào cuối có chi phí hằng số. Nếu hết chỗ, cần cấp phát vùng nhớ mới và chuyển các phần tử hiện có, nên chi phí của lần đó là tuyến tính theo số phần tử. Do những lần cấp phát lại tương đối hiếm, một chuỗi đủ dài các lần thêm có tổng chi phí như thể mỗi lần mất thời gian hằng số. Vì vậy, phép chèn này có độ phức tạp **hằng số trung bình phân bổ**.

:::tip Ghi nhớ
“Trung bình phân bổ” là trung bình trên **chuỗi thao tác**; nó không có nghĩa từng thao tác đều chạy trong thời gian hằng số, cũng không nhất thiết là trung bình xác suất theo dữ liệu đầu vào.
:::
