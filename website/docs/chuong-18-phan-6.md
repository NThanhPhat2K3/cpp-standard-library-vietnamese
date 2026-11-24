---
id: chuong-18-phan-6
title: 'Chương 18 · Data race và đồng bộ'
---

Phần này theo mục 18.4, trang 982–988. Chạy nhiều thread có thể cải thiện khả năng tận dụng tài nguyên, nhưng dữ liệu dùng chung cần quy tắc truy cập và đồng bộ rõ ràng.

## Data race

Data race xảy ra khi hai thao tác xung đột trên cùng memory location thuộc hai thread khác nhau, ít nhất một thao tác không atomic, và không thao tác nào *happens-before* thao tác kia. Trong C++, data race dẫn tới hành vi không xác định. Không thể giới hạn kết quả vào vài giá trị dự đoán như “cũ”, “mới” hoặc “ghi dở”.

Nhiều thread chỉ đọc cùng dữ liệu, khi không có ai sửa đồng thời và lifetime được bảo đảm, thường an toàn. Với container chuẩn, có bảo đảm cho phép sửa đồng thời các phần tử khác nhau trong nhiều trường hợp; `vector<bool>` là ngoại lệ vì các bit có thể cùng nằm trong một đơn vị lưu trữ. Thao tác thay đổi cấu trúc container như thêm, xóa hoặc cấp phát lại cần được xét riêng. Các bit-field liền kề cũng có thể chia sẻ memory location.

## Bảo vệ cả thao tác logic

Một điều kiện và hành động dựa trên nó có thể cần cùng một vùng bảo vệ. Ví dụ `if (!v.empty()) v.front()` không an toàn nếu thread khác có thể xóa phần tử giữa hai thao tác. Ngay cả khi từng thao tác riêng được bảo vệ bằng khóa riêng lẻ, điều kiện vẫn có thể thay đổi giữa hai lần khóa.

```cpp
#include <cassert>
#include <mutex>
#include <thread>
#include <vector>

int main() {
    std::mutex mutex;
    std::vector<int> values;
    std::thread producer([&] {
        std::lock_guard<std::mutex> lock(mutex);
        values.push_back(42);
    });
    producer.join();
    int result = 0;
    {
        std::lock_guard<std::mutex> lock(mutex);
        if (!values.empty()) result = values.front();
    }
    assert(result == 42);
}
```

Các truy cập cạnh tranh phải cùng tuân thủ quy tắc khóa; khóa chỉ ở một phía không bảo vệ phía còn lại. Ví dụ dùng `join()` để đơn giản hóa thứ tự, còn mutex minh họa cách đặt thao tác kiểm tra và truy cập trong cùng vùng khóa.

## Thứ tự và công bố dữ liệu

Compiler và phần cứng có thể tối ưu theo các bảo đảm của mô hình bộ nhớ. Mẫu dùng `bool ready` thông thường để một thread báo dữ liệu cho thread khác, trong khi thread kia vừa đọc cờ vừa đọc dữ liệu, tạo data race nếu không đồng bộ. Không thể sửa bằng cách thêm `yield()` hoặc `volatile`.

Một cách công bố dữ liệu là atomic với release/acquire:

```cpp
#include <atomic>
#include <cassert>
#include <thread>

int main() {
    int data = 0;
    std::atomic<bool> ready(false);
    std::thread producer([&] {
        data = 42;
        ready.store(true, std::memory_order_release);
    });
    while (!ready.load(std::memory_order_acquire))
        std::this_thread::yield();
    assert(data == 42);
    producer.join();
}
```

Khi load acquire đọc giá trị được store release công bố, các thao tác trước store được đồng bộ với thao tác sau load; trong ví dụ này đọc `data` sau khi thấy `ready` là an toàn. Đây là một mô hình một lần công bố; nếu tiếp tục sửa `data` đồng thời, cần giao thức bổ sung. `yield` chỉ giảm bớt việc chiếm CPU trong một số tình huống, không tạo đồng bộ.

## Chọn công cụ

`future`/`promise` thuận tiện để chuyển kết quả và tín hiệu hoàn tất; mutex bảo vệ vùng dữ liệu chung; condition variable giúp chờ predicate; atomic cung cấp thao tác nguyên tử và quy tắc thứ tự bộ nhớ. `volatile` trong C++ không cung cấp tính nguyên tử hay quan hệ đồng bộ giữa các thread. Các mục sau đi sâu từng công cụ và điều kiện sử dụng.
