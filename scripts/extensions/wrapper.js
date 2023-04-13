function Wrapper(init, onChange = () => void 0)
{
    this.val = init;
    this.onChange = onChange;

    this.value = function()
    {
        return this.val;
    }

    this.set = function(new_value)
    {
        this.val = new_value;
        this.onChange(new_value);
    }
}