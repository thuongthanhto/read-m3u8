function Log(message)
{
    output_field.innerHTML = `${output_field.innerHTML}\n${message}\n`
    output_field.scrollTop  = output_field.scrollHeight;

    console.log(message);
}