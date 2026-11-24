---
id: chuong-18-phan-5
title: 'Chương 18 · Tham khảo future, promise và thread'
---

Phần này đối chiếu mục 18.3, trang 973–981. Các bảng tập trung vào điều kiện và vòng đời của giao diện C++11.

## Chính sách khởi chạy của `async`

| Policy | Thời điểm chạy callable | Nếu không lấy kết quả |
| --- | --- | --- |
| `std::launch::async` | Yêu cầu chạy bất đồng bộ; nếu không tạo được thread, lời gọi có thể ném `std::system_error`. | Giải phóng tham chiếu cuối tới shared state có thể phải chờ task hoàn tất. |
| `std::launch::deferred` | Chạy đồng bộ trong thread đầu tiên gọi `get()` hoặc `wait()` không có timeout. | Nếu không có lời gọi chờ như vậy, callable có thể không bao giờ chạy. |
| Mặc định | Implementation chọn một policy được phép; không đảm bảo tạo thread mới. | Phải xét cả hai khả năng trên. |

`wait_for()` và `wait_until()` chỉ báo `std::future_status::deferred` khi gặp công việc deferred, chúng không khởi chạy công việc đó. Có thể truyền `std::launch::async | std::launch::deferred` để cho phép cả hai chính sách chuẩn như lời gọi mặc định. Một số nhận xét trong sách mô tả implementation sẽ chạy ngay nếu có tài nguyên; không nên dựa vào điều đó: lựa chọn giữa các chính sách cho phép phụ thuộc implementation.

```cpp
#include <cassert>
#include <chrono>
#include <future>

int main() {
    bool ran = false;
    auto result = std::async(std::launch::deferred, [&] {
        ran = true;
        return 42;
    });
    const auto status = result.wait_for(std::chrono::seconds(0));
    assert(status == std::future_status::deferred);
    assert(!ran);
    const int value = result.get();
    assert(value == 42 && ran);
}
```

Biến `ran` ở đây an toàn vì policy deferred khiến callable chạy ngay trong thread gọi `get()`. Nếu chuyển sang `launch::async`, không được đọc và ghi `ran` đồng thời nếu chưa có đồng bộ phù hợp.

## Future và shared future

| Thao tác | `future<T>` | `shared_future<T>` |
| --- | --- | --- |
| Sao chép | Không; chỉ move. | Có thể copy và move. |
| `valid()` | Kiểm tra có shared state. | Tương tự. |
| `get()` | Chờ, lấy giá trị hoặc ném ngoại lệ, rồi mất state. | Có thể gọi nhiều lần; thường trả `const T&`. |
| `wait()` | Chờ; thực thi task deferred nếu cần. | Tương tự. |
| `wait_for`, `wait_until` | Trả `ready`, `timeout` hoặc `deferred`. | Tương tự. |
| `share()` | Chuyển state sang `shared_future`. | Không có. |

Future mặc định không có state. Kiểm tra `valid()` trước khi gọi hàm yêu cầu state. Với `future<T&>` hoặc `shared_future<T&>`, `get()` trả tham chiếu; với `void`, không có giá trị. Hủy handle chỉ giải phóng tham chiếu tới state; chờ khi giải phóng state cuối có điều kiện đặc biệt đối với task được tạo bởi `std::async` chạy bất đồng bộ, không áp dụng chung cho mọi future từ promise.

`shared_future<T>::get()` thường trả tham chiếu tới kết quả trong shared state; tham chiếu đó không được dùng sau khi state bị hủy. Có thể tạo các bản sao `shared_future` cho các thread cùng chờ, nhưng nếu kết quả là đối tượng có thể thay đổi, việc dùng hoặc sửa đối tượng được tham chiếu vẫn cần tuân thủ quy tắc đồng bộ riêng. Chia sẻ future không tự làm mọi thao tác trên dữ liệu trả về an toàn.

## Promise

`promise<T>` mặc định tạo shared state, có thể move và swap nhưng không copy. `get_future()` chỉ lấy được một lần; gọi lần nữa ném `future_error` với `future_already_retrieved`. `set_value`, `set_exception` đặt kết quả; các biến thể `_at_thread_exit` trì hoãn làm state sẵn sàng đến khi thread thoát. Đặt lần nữa có thể báo `promise_already_satisfied`; hủy promise chưa thỏa mãn khiến future nhận `broken_promise`.

Các thao tác đặt kết quả trên cùng state được phối hợp để không đồng thời ghi hai kết quả thành công, nhưng điều đó không biến mọi thao tác trên cùng đối tượng promise hoặc dữ liệu bên ngoài thành thread-safe.

## Packaged task

`packaged_task<R(Args...)>` lưu callable và shared state. `valid()` kiểm tra state; `get_future()` lấy future một lần; `operator()(args...)` gọi callable và lưu kết quả hoặc ngoại lệ từ **lời gọi callable**. `make_ready_at_thread_exit` gọi callable nhưng trì hoãn ready; `reset()` tạo state mới và bỏ state cũ. Nếu state cũ chưa có kết quả, future cũ có thể nhận `broken_promise`.

:::note Đính chính sách
Sách nói ngoại lệ từ constructor tạo `packaged_task` được lưu vào state. Nếu constructor không hoàn tất, ngoại lệ được truyền cho nơi gọi constructor; không có task đã tạo thành công để lấy future. Ngoại lệ từ callable khi task được gọi mới được lưu làm kết quả của task.
:::

## Thread và `this_thread`

| Thao tác | Ý nghĩa |
| --- | --- |
| `thread()` | Tạo handle không joinable. |
| `thread(callable, args...)` | Tạo thread mới hoặc ném lỗi tạo thread. |
| `joinable()` | Cho biết handle còn gắn với thread. |
| `join()`, `detach()` | Chờ kết thúc hoặc tách handle; sau đó handle không joinable. |
| `get_id()` | ID của thread gắn với handle, hoặc ID mặc định nếu không gắn. |
| `hardware_concurrency()` | Gợi ý số thread phần cứng, có thể trả 0. |
| `native_handle()` | Handle phụ thuộc nền tảng, chỉ dùng khi hiểu extension tương ứng. |

Thread đã kết thúc vẫn có thể joinable cho đến khi được join hoặc detach. Hủy hoặc move-assign vào một handle đang joinable gọi `std::terminate()`. ID có thể được tái sử dụng sau khi thread kết thúc; không giả định giá trị số của ID.

`std::this_thread::get_id()`, `sleep_for(duration)`, `sleep_until(time_point)` và `yield()` thao tác trên thread hiện tại. `yield()` chỉ là gợi ý cho scheduler, không đồng bộ dữ liệu hay bảo đảm tiến độ của thread khác. Dùng clock phù hợp khi chờ vì điều chỉnh đồng hồ hệ thống có thể ảnh hưởng deadline.
