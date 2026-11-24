[← Trang chủ](../README.md)

# 📖 Chương 1 · Giới thiệu về cuốn sách

> **Trong chương này:** Tại sao thư viện chuẩn quan trọng, sách được tổ chức như thế nào và nên đọc sách ra sao.
>
> **Nguồn:** *The C++ Standard Library*, ấn bản thứ hai, Nicolai M. Josuttis, Chương 1, trang 1–5. Đây là bản dịch tiếng Việt; các phần “Góc nhìn hiện đại” là ghi chú bổ sung, không thuộc nguyên tác.

## 🗺️ Mục lục

1. [Tại sao có cuốn sách này?](#11-tại-sao-có-cuốn-sách-này)
2. [Trước khi đọc](#12-trước-khi-đọc)
3. [Cách trình bày và cấu trúc](#13-cách-trình-bày-và-cấu-trúc)
4. [Cách đọc sách](#14-cách-đọc-sách)
5. [Tình hình tại thời điểm viết sách](#15-tình-hình-tại-thời-điểm-viết-sách)
6. [Mã ví dụ và thông tin bổ sung](#16-mã-ví-dụ-và-thông-tin-bổ-sung)
7. [Phản hồi](#17-phản-hồi)

---

## 1.1 Tại sao có cuốn sách này?

Không lâu sau khi ra đời, C++ đã trở thành một tiêu chuẩn trên thực tế trong lập trình hướng đối tượng. Điều đó dẫn đến mục tiêu chuẩn hóa ngôn ngữ. Chỉ khi có một tiêu chuẩn, người ta mới có thể viết các chương trình chạy trên nhiều nền tảng, từ máy tính cá nhân đến máy tính lớn. Bên cạnh đó, một thư viện chuẩn cho phép lập trình viên sử dụng các thành phần dùng chung và làm việc ở mức trừu tượng cao hơn mà vẫn giữ được khả năng chuyển đổi giữa các nền tảng, thay vì phải tự viết mọi thứ từ đầu.

Với tiêu chuẩn thứ hai, C++11 (xem mục 2.1, trang 7, để tìm hiểu lịch sử chi tiết của các tiêu chuẩn C++), chúng ta có một thư viện chuẩn C++ đồ sộ. Phần đặc tả thư viện dài hơn gấp đôi phần đặc tả các tính năng cốt lõi của ngôn ngữ. Thư viện cho phép sử dụng:

- Các lớp nhập/xuất (*input/output* hay I/O).
- Các kiểu chuỗi và biểu thức chính quy.
- Nhiều cấu trúc dữ liệu như mảng động, danh sách liên kết, cây nhị phân và bảng băm.
- Nhiều thuật toán, chẳng hạn các thuật toán sắp xếp.
- Các lớp hỗ trợ đa luồng và xử lý đồng thời.
- Các lớp hỗ trợ quốc tế hóa.
- Các lớp phục vụ tính toán số.
- Rất nhiều tiện ích khác.

Tuy nhiên, thư viện không tự giải thích được mọi điều. Để sử dụng các thành phần và tận dụng sức mạnh của chúng, bạn cần một tài liệu giải thích các khái niệm và chi tiết quan trọng, thay vì chỉ liệt kê các lớp cùng hàm của chúng. Cuốn sách này được viết chính vì mục đích đó: trước tiên giới thiệu thư viện và các thành phần dưới góc độ khái niệm, sau đó mô tả những chi tiết cần thiết cho lập trình thực tế. Các ví dụ minh họa cách sử dụng cụ thể của từng thành phần.

Vì vậy, đây là tài liệu nhập môn chi tiết về thư viện C++ dành cho cả người mới lẫn lập trình viên đang làm việc. Với thông tin trong sách, bạn có thể tận dụng đầy đủ hơn thư viện chuẩn C++.

> [!WARNING]
> Tác giả không hứa rằng mọi nội dung đều đơn giản và dễ hiểu ngay. Thư viện rất linh hoạt, nhưng sự linh hoạt cho những mục đích không đơn giản luôn có cái giá của nó. Thư viện có những cạm bẫy; sách sẽ chỉ ra chúng khi gặp phải và đề xuất cách tránh.

## 1.2 Trước khi đọc

Để tận dụng tốt nhất cuốn sách, bạn nên biết C++ từ trước. Sách mô tả các thành phần chuẩn của C++, chứ không dạy toàn bộ ngôn ngữ. Bạn nên quen với các khái niệm lớp, kế thừa, template, xử lý ngoại lệ và namespace. Tuy nhiên, bạn không cần biết mọi chi tiết nhỏ của ngôn ngữ: sách sẽ giải thích những chi tiết quan trọng. Các chi tiết nhỏ thường quan trọng hơn với người muốn **triển khai** thư viện so với người chỉ muốn **sử dụng** nó.

Ngôn ngữ đã thay đổi trong quá trình chuẩn hóa C++11, cũng như từng thay đổi khi C++98 được chuẩn hóa; vì thế kiến thức của bạn có thể chưa được cập nhật. Chương 3 giới thiệu ngắn gọn những tính năng ngôn ngữ mới quan trọng để dùng thư viện C++11. Nhiều tính năng mới của thư viện dựa trên chúng, nên tác giả khuyên bạn đọc Chương 3 để ôn tập. Khi một thư viện dùng đến tính năng mới, sách cũng sẽ dẫn chiếu về chương đó.

> [!TIP]
> **Góc nhìn hiện đại:** “Mới” trong đoạn trên là mới so với thời điểm sách được viết. Khi học hôm nay, hãy xem C++11 là nền tảng và đối chiếu thêm các phiên bản C++ ra đời sau đó theo nhu cầu của dự án.

## 1.3 Cách trình bày và cấu trúc

Các thành phần của thư viện chuẩn C++ tương đối độc lập, nhưng không hoàn toàn tách biệt; vì vậy khó mô tả từng phần mà không nhắc đến những phần khác. Tác giả cân nhắc nhiều cách trình bày: theo thứ tự của tiêu chuẩn C++, giới thiệu tổng quan trước rồi đi vào chi tiết, hoặc sắp xếp các thành phần sao cho giảm tối đa việc dẫn chiếu chéo. Cuối cùng, sách kết hợp cả ba cách.

Sách bắt đầu bằng phần giới thiệu ngắn về các khái niệm chung và những tiện ích mà thư viện sử dụng. Sau đó, mỗi thành phần được trình bày trong một hoặc nhiều chương. Thành phần đầu tiên là **STL** (*Standard Template Library*). Theo tác giả, STL là phần mạnh mẽ, phức tạp và thú vị nhất của thư viện; thiết kế của nó ảnh hưởng sâu sắc đến các thành phần khác. Tiếp theo là những thành phần dễ nắm bắt hơn như các container đặc biệt, chuỗi và biểu thức chính quy; rồi đến thư viện IOStream, quốc tế hóa, tính toán số, xử lý đồng thời và bộ cấp phát.

Mỗi phần thường bắt đầu bằng mục đích, thiết kế và ví dụ; tiếp theo là các cách sử dụng cùng những cạm bẫy; cuối cùng thường có phần tra cứu với chữ ký và định nghĩa chính xác của các lớp, hàm.

### 📚 Nội dung các chương

**Chương 1–5: Nhập môn**

| Chương | Nội dung |
|:---|:---|
| 1 · Giới thiệu về cuốn sách | Chủ đề và nội dung của sách. |
| 2 · C++ và thư viện chuẩn | Lịch sử, bối cảnh chuẩn hóa và khái niệm độ phức tạp. |
| 3 · Các tính năng ngôn ngữ mới | Những tính năng cần biết để đọc sách và dùng thư viện chuẩn. |
| 4 · Các khái niệm chung | Namespace `std`, header, xử lý lỗi và ngoại lệ. |
| 5 · Các tiện ích | `pair`, `tuple`, smart pointer, giới hạn số, type traits, hàm hỗ trợ, `ratio`, đồng hồ, bộ định thời và các hàm C. |

**Chương 6–11: STL**

| Chương | Nội dung |
|:---|:---|
| 6 · Thư viện khuôn mẫu chuẩn | Tổng quan về container, thuật toán, các khái niệm và kỹ thuật của STL. |
| 7 · Các container STL | Array, vector, deque, list, forward list, set, map và container không có thứ tự; khả năng, ưu nhược điểm và ví dụ. |
| 8 · Thành viên của container | Tra cứu chi tiết các kiểu và phép toán của container. |
| 9 · Iterator | Các nhóm iterator, hàm hỗ trợ và adapter như stream, reverse, insert và move iterator. |
| 10 · Function object và lambda | Các lớp function object, lambda và cách dùng chúng để xác định hành vi của container và thuật toán. |
| 11 · Thuật toán STL | Giới thiệu, so sánh và mô tả chi tiết các thuật toán kèm chương trình ví dụ. |

**Chương 12–19: Các thành phần còn lại**

| Chương | Nội dung |
|:---|:---|
| 12 · Container đặc biệt | Adapter cho hàng đợi, ngăn xếp và `bitset` để quản lý các bit hoặc cờ. |
| 13 · Chuỗi | Các kiểu chuỗi chuẩn và hỗ trợ nhiều kiểu ký tự. |
| 14 · Biểu thức chính quy | Giao diện tìm kiếm và thay thế ký tự, chuỗi con. |
| 15 · Nhập/xuất bằng stream | IOStream và các chi tiết như định nghĩa, tích hợp kênh I/O riêng. |
| 16 · Quốc tế hóa | Bộ ký tự, cách biểu diễn số dấu phẩy động và ngày tháng. |
| 17 · Tính toán số | Số ngẫu nhiên, phân phối, số phức và một số hàm số học của C. |
| 18 · Xử lý đồng thời | Các tính năng hỗ trợ concurrency và đa luồng. |
| 19 · Bộ cấp phát | Khái niệm về các mô hình bộ nhớ khác nhau trong thư viện chuẩn. |

Sách kết thúc bằng thư mục tài liệu tham khảo và bảng tra cứu. Vì khuôn khổ sách có hạn, một số nội dung ít liên quan hơn với lập trình viên ứng dụng thông thường được đưa sang chương bổ sung trên [trang web của sách](http://www.cppstdlib.com): chi tiết về `bitset`, lớp `valarray` và chi tiết về allocator. Đây là địa chỉ được tác giả ghi trong sách.

## 1.4 Cách đọc sách

Cuốn sách vừa là tài liệu hướng dẫn nhập môn, vừa là tài liệu tra cứu có cấu trúc về thư viện chuẩn C++. Các thành phần tương đối độc lập; do đó, sau khi đọc Chương 2–5, bạn có thể đọc những chương về từng thành phần theo thứ tự tùy ý. Tuy nhiên, Chương 6–11 cùng nói về STL. Để hiểu các chương STL còn lại, bạn nên bắt đầu bằng phần giới thiệu ở Chương 6.

Nếu là lập trình viên C++ muốn nắm tổng quan các khái niệm và mọi phần của thư viện, bạn có thể đọc sách từ đầu đến cuối, nhưng nên bỏ qua các phần tra cứu chi tiết trong lượt đọc đó. Khi lập trình với một thành phần cụ thể, hãy dùng bảng tra cứu ở cuối sách để tìm nội dung cần thiết; tác giả đã cố gắng làm bảng này đủ đầy để giúp bạn tiết kiệm thời gian.

Theo kinh nghiệm của tác giả, cách tốt nhất để học điều mới là xem ví dụ. Vì vậy, sách có nhiều ví dụ, từ vài dòng mã đến chương trình hoàn chỉnh. Với chương trình hoàn chỉnh, dòng chú thích đầu tiên cho biết tên tệp chứa chương trình. Các tệp có trên [trang web của sách](http://www.cppstdlib.com).

## 1.5 Tình hình tại thời điểm viết sách

Tiêu chuẩn C++11 được hoàn thành trong khi tác giả đang viết sách. Khi đó, một số trình biên dịch có thể chưa tuân thủ tiêu chuẩn, dù tình hình nhiều khả năng sẽ sớm thay đổi. Do đó, có thể không phải mọi ví dụ trong sách đều chạy đúng như mô tả trên hệ thống của bạn; bạn có thể phải điều chỉnh chương trình ví dụ cho phù hợp với môi trường cụ thể.

> [!NOTE]
> **Góc nhìn hiện đại:** Đây là lưu ý lịch sử của tác giả. Ngày nay, khi chạy ví dụ, điều quan trọng vẫn là kiểm tra phiên bản ngôn ngữ, trình biên dịch và thư viện chuẩn mà dự án thực sự sử dụng.

## 1.6 Mã ví dụ và thông tin bổ sung

Bạn có thể tìm tất cả chương trình ví dụ và thêm thông tin về sách cũng như thư viện chuẩn C++ trên [trang web của tác giả](http://www.cppstdlib.com). Trên Internet cũng có nhiều tài liệu liên quan khác; một số được liệt kê trong thư mục tài liệu tham khảo, vốn cũng có trên trang web của sách.

## 1.7 Phản hồi

Tác giả hoan nghênh mọi phản hồi, cả tích cực lẫn tiêu cực. Dù đã cố gắng chuẩn bị cẩn thận, tác giả vẫn có thể mắc lỗi, để lại điểm chưa nhất quán hoặc trình bày một chủ đề chưa thật tốt. Phản hồi giúp tác giả cải thiện các ấn bản sau.

Theo sách, cách tốt nhất để liên hệ là qua email. Để tránh thư rác, tác giả không in địa chỉ email trong sách; bạn có thể tìm địa chỉ để gửi phản hồi trên [trang web của sách](http://www.cppstdlib.com). Tác giả chân thành cảm ơn bạn đọc.

---

[← Về trang chủ](../README.md)
